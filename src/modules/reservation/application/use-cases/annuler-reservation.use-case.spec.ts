import { NotFoundException, ConflictException } from '@nestjs/common';
import { AnnulerReservationUseCase } from './annuler-reservation.use-case';
import {
  IReservationRepository,
  StatutReservation,
} from '../../domain/ports/reservation.repository.port';

describe('AnnulerReservationUseCase', () => {
  let useCase: AnnulerReservationUseCase;
  let mockRepo: jest.Mocked<IReservationRepository>;

  const resaConfirmee = {
    id: 'resa-uuid',
    tenantId: 'tenant-A',
    logementId: 'log-uuid',
    dateDebut: new Date(),
    dateFin: new Date(),
    nbNuits: 3,
    nbPersonnes: 2,
    montantTotal: 360,
    statut: StatutReservation.CONFIRMEE,
    voyageurNom: 'Martin',
    voyageurPrenom: 'Paul',
    voyageurEmail: 'paul@test.fr',
  };

  beforeEach(() => {
    mockRepo = {
      findById: jest.fn(),
      findByLogement: jest.fn(),
      existsConflict: jest.fn(),
      save: jest.fn(),
      updateStatut: jest.fn(),
      createHold: jest.fn(),
      deleteExpiredHolds: jest.fn(),
      existsActiveHold: jest.fn(),
    };
    useCase = new AnnulerReservationUseCase(mockRepo);
  });

  afterEach(() => jest.clearAllMocks());

  // TEST-RESA-05 — Isolation multi-tenant
  it('TEST-RESA-05: retourne 404 quand réservation appartient à un autre tenant', async () => {
    mockRepo.findById.mockResolvedValue(null);

    await expect(useCase.execute('resa-uuid', 'tenant-B')).rejects.toThrow(
      NotFoundException,
    );
  });

  // TEST-RESA-06 — Annulation par gestionnaire
  it('TEST-RESA-06: annule une réservation CONFIRMEE', async () => {
    mockRepo.findById.mockResolvedValue(resaConfirmee);
    mockRepo.updateStatut.mockResolvedValue();

    const result = await useCase.execute('resa-uuid', 'tenant-A');

    expect(result.statut).toBe(StatutReservation.ANNULEE);
    expect(mockRepo.updateStatut).toHaveBeenCalledWith(
      'resa-uuid',
      'tenant-A',
      StatutReservation.ANNULEE,
    );
  });

  // TEST-RESA-07 — Annulation déjà annulée
  it('TEST-RESA-07: lève ConflictException "Cette réservation est déjà annulée"', async () => {
    mockRepo.findById.mockResolvedValue({
      ...resaConfirmee,
      statut: StatutReservation.ANNULEE,
    });

    await expect(useCase.execute('resa-uuid', 'tenant-A')).rejects.toThrow(
      new ConflictException('Cette réservation est déjà annulée'),
    );
  });
});
