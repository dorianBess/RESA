import { ConflictException } from '@nestjs/common';
import { CreerBlocageUseCase } from './creer-blocage.use-case';
import { IBlocageRepository, SourceBlocage } from '../../domain/ports/blocage.repository.port';

describe('CreerBlocageUseCase', () => {
  let useCase: CreerBlocageUseCase;
  let mockRepo: jest.Mocked<IBlocageRepository>;

  const cmd = {
    logementId: 'log-uuid', tenantId: 'tenant-A',
    dateDebut: new Date('2025-07-20'), dateFin: new Date('2025-07-25'),
    motif: 'Travaux',
  };

  beforeEach(() => {
    mockRepo = {
      findByLogement: jest.fn(), findById: jest.fn(),
      existsConflictWithReservation: jest.fn(), existsConflict: jest.fn(),
      create: jest.fn(), delete: jest.fn(), findByDateRange: jest.fn(),
    };
    useCase = new CreerBlocageUseCase(mockRepo);
  });

  afterEach(() => jest.clearAllMocks());

  // TEST-BLOCAGE-01 — Blocage réussi
  it('TEST-BLOCAGE-01: crée blocage avec source MANUEL', async () => {
    mockRepo.existsConflictWithReservation.mockResolvedValue(false);
    mockRepo.create.mockResolvedValue({
      id: 'blocage-uuid', logementId: 'log-uuid', tenantId: 'tenant-A',
      dateDebut: cmd.dateDebut, dateFin: cmd.dateFin,
      source: SourceBlocage.MANUEL, motif: 'Travaux',
    });

    const result = await useCase.execute(cmd);

    expect(result.source).toBe(SourceBlocage.MANUEL);
    expect(mockRepo.create).toHaveBeenCalledWith(
      expect.objectContaining({ source: SourceBlocage.MANUEL }),
    );
  });

  // TEST-BLOCAGE-02 — Chevauchement réservation
  it('TEST-BLOCAGE-02: lève ConflictException "Ces dates chevauchent une réservation existante"', async () => {
    mockRepo.existsConflictWithReservation.mockResolvedValue(true);

    await expect(useCase.execute(cmd)).rejects.toThrow(
      new ConflictException('Ces dates chevauchent une réservation existante'),
    );
  });
});
