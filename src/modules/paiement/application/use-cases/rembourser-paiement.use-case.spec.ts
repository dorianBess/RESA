import { BadRequestException } from '@nestjs/common';
import { RembourserPaiementUseCase } from './rembourser-paiement.use-case';
import {
  IPaiementRepository,
  StatutPaiement,
  TypePaiement,
} from '../../domain/ports/paiement.repository.port';
import { IStripeService } from '@modules/reservation/domain/ports/stripe.service.port';

describe('RembourserPaiementUseCase', () => {
  let useCase: RembourserPaiementUseCase;
  let mockPaiementRepo: jest.Mocked<IPaiementRepository>;
  let mockStripe: jest.Mocked<IStripeService>;

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
    mockStripe = {
      createPaymentIntent: jest.fn(),
      retrievePaymentIntent: jest.fn(),
      refund: jest.fn(),
    };
    useCase = new RembourserPaiementUseCase(mockPaiementRepo, mockStripe);
  });

  afterEach(() => jest.clearAllMocks());

  // TEST-PAIE-05 — Remboursement total
  it('TEST-PAIE-05: rembourse 840€ total, statut REMBOURSE', async () => {
    mockPaiementRepo.findById.mockResolvedValue(paiementCapture);
    mockStripe.refund.mockResolvedValue();
    mockPaiementRepo.updateStatut.mockResolvedValue({
      ...paiementCapture,
      statut: StatutPaiement.REMBOURSE,
      montantRembourse: 840,
    });

    const result = await useCase.execute('paie-uuid');

    expect(result.statut).toBe(StatutPaiement.REMBOURSE);
    expect(result.montantRembourse).toBe(840);
    expect(mockStripe.refund).toHaveBeenCalledWith('pi_valid', 84000);
  });

  // TEST-PAIE-06 — Remboursement partiel 420€
  it('TEST-PAIE-06: rembourse partiellement 420€', async () => {
    mockPaiementRepo.findById.mockResolvedValue(paiementCapture);
    mockStripe.refund.mockResolvedValue();
    mockPaiementRepo.updateStatut.mockResolvedValue({
      ...paiementCapture,
      statut: StatutPaiement.REMBOURSE,
      montantRembourse: 420,
    });

    const result = await useCase.execute('paie-uuid', 420);

    expect(result.montantRembourse).toBe(420);
    expect(mockStripe.refund).toHaveBeenCalledWith('pi_valid', 42000);
  });

  // TEST-PAIE-07 — Montant > paiement original
  it('TEST-PAIE-07: lève BadRequestException "montant du remboursement ne peut pas dépasser"', async () => {
    mockPaiementRepo.findById.mockResolvedValue(paiementCapture);

    await expect(useCase.execute('paie-uuid', 1000)).rejects.toThrow(
      new BadRequestException(
        'Le montant du remboursement ne peut pas dépasser le montant payé',
      ),
    );
  });
});
