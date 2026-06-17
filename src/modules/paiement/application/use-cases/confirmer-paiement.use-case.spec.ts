import { BadRequestException } from '@nestjs/common';
import { ConfirmerPaiementUseCase } from './confirmer-paiement.use-case';
import {
  IPaiementRepository,
  StatutPaiement,
  TypePaiement,
} from '../../domain/ports/paiement.repository.port';
import { IReservationPaiementRepository } from '../../domain/ports/reservation-paiement.repository.port';
import { IStripeService } from '@modules/reservation/domain/ports/stripe.service.port';

describe('ConfirmerPaiementUseCase', () => {
  let useCase: ConfirmerPaiementUseCase;
  let mockPaiementRepo: jest.Mocked<IPaiementRepository>;
  let mockResaRepo: jest.Mocked<IReservationPaiementRepository>;
  let mockStripe: jest.Mocked<IStripeService>;

  const resa = {
    id: 'resa-uuid',
    tenantId: 'tenant-A',
    statut: 'EN_ATTENTE',
    montantTotal: 840,
    stripePaymentIntentId: 'pi_valid',
  };

  const paiementCapture = {
    id: 'paie-uuid',
    reservationId: 'resa-uuid',
    tenantId: 'tenant-A',
    type: TypePaiement.TOTAL,
    statut: StatutPaiement.CAPTURE,
    montant: 840,
    stripePaymentIntentId: 'pi_valid',
  };

  beforeEach(() => {
    mockPaiementRepo = {
      findById: jest.fn(),
      findByPaymentIntentId: jest.fn(),
      save: jest.fn(),
      updateStatut: jest.fn(),
    };
    mockResaRepo = {
      findByPaymentIntentId: jest.fn(),
      updateStatut: jest.fn(),
    };
    mockStripe = {
      createPaymentIntent: jest.fn(),
      retrievePaymentIntent: jest.fn(),
      refund: jest.fn(),
    };
    useCase = new ConfirmerPaiementUseCase(
      mockPaiementRepo,
      mockResaRepo,
      mockStripe,
    );
  });

  afterEach(() => jest.clearAllMocks());

  // TEST-PAIE-01 — Confirmation réussie
  it('TEST-PAIE-01: paiement CAPTURE + réservation CONFIRMEE', async () => {
    mockPaiementRepo.findByPaymentIntentId.mockResolvedValue(null);
    mockResaRepo.findByPaymentIntentId.mockResolvedValue(resa);
    mockStripe.retrievePaymentIntent.mockResolvedValue({
      id: 'pi_valid',
      status: 'succeeded',
      amount: 84000,
    });
    mockPaiementRepo.save.mockResolvedValue(paiementCapture);
    mockResaRepo.updateStatut.mockResolvedValue();

    const result = await useCase.execute('pi_valid');

    expect(result.statut).toBe(StatutPaiement.CAPTURE);
    expect(mockResaRepo.updateStatut).toHaveBeenCalledWith(
      'resa-uuid',
      'CONFIRMEE',
    );
  });

  // TEST-PAIE-02 — PaymentIntent invalide
  it('TEST-PAIE-02: lève BadRequestException "PaymentIntent invalide ou non confirmé"', async () => {
    mockPaiementRepo.findByPaymentIntentId.mockResolvedValue(null);
    mockResaRepo.findByPaymentIntentId.mockResolvedValue(null);

    await expect(useCase.execute('pi_inexistant')).rejects.toThrow(
      new BadRequestException('PaymentIntent invalide ou non confirmé'),
    );
  });

  // TEST-PAIE-03 — Confirmation double idempotente
  it('TEST-PAIE-03: retourne paiement existant sans doublon (idempotence)', async () => {
    mockPaiementRepo.findByPaymentIntentId.mockResolvedValue(paiementCapture);

    const result = await useCase.execute('pi_valid');

    expect(result.statut).toBe(StatutPaiement.CAPTURE);
    expect(mockPaiementRepo.save).not.toHaveBeenCalled();
    expect(mockResaRepo.updateStatut).not.toHaveBeenCalled();
  });

  // TEST-PAIE-04 — Acompte capturé
  it('TEST-PAIE-04: paiement type ACOMPTE CAPTURE quand acompte activé', async () => {
    const resaAvecAcompte = { ...resa, montantAcompte: 252 };
    const paiementAcompte = {
      ...paiementCapture,
      type: TypePaiement.ACOMPTE,
      montant: 252,
    };
    mockPaiementRepo.findByPaymentIntentId.mockResolvedValue(null);
    mockResaRepo.findByPaymentIntentId.mockResolvedValue(resaAvecAcompte);
    mockStripe.retrievePaymentIntent.mockResolvedValue({
      id: 'pi_valid',
      status: 'succeeded',
      amount: 25200,
    });
    mockPaiementRepo.save.mockResolvedValue(paiementAcompte);
    mockResaRepo.updateStatut.mockResolvedValue();

    const result = await useCase.execute('pi_valid');

    expect(result.type).toBe(TypePaiement.ACOMPTE);
    expect(mockPaiementRepo.save).toHaveBeenCalledWith(
      expect.objectContaining({ type: TypePaiement.ACOMPTE }),
    );
  });
});
