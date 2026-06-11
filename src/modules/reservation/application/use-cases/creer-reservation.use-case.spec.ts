import { BadRequestException, ConflictException } from '@nestjs/common';
import { CreerReservationUseCase, LogementInfo } from './creer-reservation.use-case';
import { IReservationRepository, StatutReservation } from '../../domain/ports/reservation.repository.port';
import { IStripeService } from '../../domain/ports/stripe.service.port';

describe('CreerReservationUseCase', () => {
  let useCase: CreerReservationUseCase;
  let mockRepo: jest.Mocked<IReservationRepository>;
  let mockStripe: jest.Mocked<IStripeService>;

  const logement: LogementInfo = {
    id: 'log-uuid', tenantId: 'tenant-A', capacite: 6,
    prixParNuit: 120, acompteConfig: null,
  };

  const baseCmd = {
    tenantId: 'tenant-A', logementId: 'log-uuid',
    dateDebut: new Date('2025-07-10'), dateFin: new Date('2025-07-17'),
    nbPersonnes: 4,
    voyageurNom: 'Dupont', voyageurPrenom: 'Jean',
    voyageurEmail: 'jean.dupont@email.fr',
    logement,
  };

  const reservationSauvee = {
    id: 'resa-uuid', tenantId: 'tenant-A', logementId: 'log-uuid',
    dateDebut: new Date('2025-07-10'), dateFin: new Date('2025-07-17'),
    nbNuits: 7, nbPersonnes: 4, montantTotal: 840,
    statut: StatutReservation.EN_ATTENTE,
    voyageurNom: 'Dupont', voyageurPrenom: 'Jean', voyageurEmail: 'jean.dupont@email.fr',
  };

  beforeEach(() => {
    mockRepo = {
      findById: jest.fn(), findByLogement: jest.fn(), existsConflict: jest.fn(),
      save: jest.fn(), updateStatut: jest.fn(), createHold: jest.fn(),
      deleteExpiredHolds: jest.fn(), existsActiveHold: jest.fn(),
    };
    mockStripe = {
      createPaymentIntent: jest.fn().mockResolvedValue({ id: 'pi_123', clientSecret: 'secret_abc' }),
      retrievePaymentIntent: jest.fn(),
      refund: jest.fn(),
    };
    useCase = new CreerReservationUseCase(mockRepo, mockStripe);
  });

  afterEach(() => jest.clearAllMocks());

  function setupDisponible() {
    mockRepo.existsConflict.mockResolvedValue(false);
    mockRepo.existsActiveHold.mockResolvedValue(false);
    mockRepo.createHold.mockResolvedValue({
      id: 'hold-uuid', tenantId: 'tenant-A', logementId: 'log-uuid',
      dateDebut: new Date(), dateFin: new Date(), expiresAt: new Date(), statut: 'ACTIF',
    });
    mockRepo.save.mockResolvedValue(reservationSauvee);
  }

  // TEST-RESA-01 — Création réussie sans acompte
  it('TEST-RESA-01: crée réservation statut EN_ATTENTE, clientSecret Stripe, montantAcompte null', async () => {
    setupDisponible();

    const result = await useCase.execute(baseCmd);

    expect(result.reservation.statut).toBe(StatutReservation.EN_ATTENTE);
    expect(result.clientSecret).toBe('secret_abc');
    expect(result.reservation.montantAcompte).toBeUndefined();
  });

  // TEST-RESA-02 — Création avec acompte 30%
  it('TEST-RESA-02: crée PaymentIntent pour montant acompte 30% (252€)', async () => {
    setupDisponible();
    mockRepo.save.mockResolvedValue({ ...reservationSauvee, montantAcompte: 252 });

    const cmdAvecAcompte = {
      ...baseCmd,
      logement: { ...logement, acompteConfig: { actif: true, pourcentage: 30 } },
    };

    const result = await useCase.execute(cmdAvecAcompte);

    expect(mockStripe.createPaymentIntent).toHaveBeenCalledWith(
      25200, // 252€ en centimes
      expect.any(Object),
    );
    expect(result.clientSecret).toBe('secret_abc');
  });

  // TEST-RESA-03 — Dates non disponibles
  it('TEST-RESA-03: lève ConflictException "Ces dates ne sont plus disponibles"', async () => {
    mockRepo.existsConflict.mockResolvedValue(true);

    await expect(useCase.execute(baseCmd)).rejects.toThrow(
      new ConflictException('Ces dates ne sont plus disponibles'),
    );
  });

  // TEST-RESA-04 — Email voyageur invalide
  it("TEST-RESA-04: lève BadRequestException \"Format d'email invalide\"", async () => {
    await expect(
      useCase.execute({ ...baseCmd, voyageurEmail: 'pas-un-email' }),
    ).rejects.toThrow(new BadRequestException("Format d'email invalide"));
  });
});
