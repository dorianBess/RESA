import { NotFoundException, ConflictException } from '@nestjs/common';
import { ArchiverLogementUseCase } from './archiver-logement.use-case';
import { ILogementRepository, StatutLogement } from '../../domain/ports/logement.repository.port';

describe('ArchiverLogementUseCase', () => {
  let useCase: ArchiverLogementUseCase;
  let mockRepo: jest.Mocked<ILogementRepository>;

  const logementActif = {
    id: 'logement-uuid',
    tenantId: 'tenant-A',
    nom: 'Gîte Test',
    capacite: 4,
    statut: StatutLogement.ACTIF,
  };

  beforeEach(() => {
    mockRepo = {
      findAll: jest.fn(),
      findById: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      hasReservationsFutures: jest.fn(),
      findAllWithoutTenantFilter: jest.fn(),
    };
    useCase = new ArchiverLogementUseCase(mockRepo);
  });

  afterEach(() => jest.clearAllMocks());

  // TEST-LOGEMENT-07 — Archivage réussi
  it('TEST-LOGEMENT-07: archive logement (statut ARCHIVE, non supprimé physiquement)', async () => {
    mockRepo.findById.mockResolvedValue(logementActif);
    mockRepo.hasReservationsFutures.mockResolvedValue(false);
    mockRepo.update.mockResolvedValue({ ...logementActif, statut: StatutLogement.ARCHIVE });

    const result = await useCase.execute('logement-uuid', 'tenant-A');

    expect(result.statut).toBe(StatutLogement.ARCHIVE);
    expect(mockRepo.update).toHaveBeenCalledWith(
      'logement-uuid',
      'tenant-A',
      expect.objectContaining({ statut: StatutLogement.ARCHIVE }),
    );
  });

  // TEST-LOGEMENT-08 — Archivage avec réservations futures
  it("TEST-LOGEMENT-08: lève ConflictException si réservations futures", async () => {
    mockRepo.findById.mockResolvedValue(logementActif);
    mockRepo.hasReservationsFutures.mockResolvedValue(true);

    await expect(useCase.execute('logement-uuid', 'tenant-A')).rejects.toThrow(
      new ConflictException("Impossible d'archiver un logement avec des réservations à venir"),
    );
  });
});
