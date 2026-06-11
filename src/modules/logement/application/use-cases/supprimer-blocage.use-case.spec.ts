import { NotFoundException, ForbiddenException } from '@nestjs/common';
import { SupprimerBlocageUseCase } from './supprimer-blocage.use-case';
import { IBlocageRepository, SourceBlocage } from '../../domain/ports/blocage.repository.port';

describe('SupprimerBlocageUseCase', () => {
  let useCase: SupprimerBlocageUseCase;
  let mockRepo: jest.Mocked<IBlocageRepository>;

  beforeEach(() => {
    mockRepo = {
      findByLogement: jest.fn(), findById: jest.fn(),
      existsConflictWithReservation: jest.fn(), existsConflict: jest.fn(),
      create: jest.fn(), delete: jest.fn(), findByDateRange: jest.fn(),
    };
    useCase = new SupprimerBlocageUseCase(mockRepo);
  });

  afterEach(() => jest.clearAllMocks());

  // TEST-BLOCAGE-03 — Suppression blocage manuel
  it('TEST-BLOCAGE-03: supprime un blocage source MANUEL', async () => {
    mockRepo.findById.mockResolvedValue({
      id: 'blocage-uuid', logementId: 'log-uuid', tenantId: 'tenant-A',
      dateDebut: new Date(), dateFin: new Date(), source: SourceBlocage.MANUEL,
    });
    mockRepo.delete.mockResolvedValue();

    await expect(useCase.execute('blocage-uuid', 'tenant-A')).resolves.toBeUndefined();
    expect(mockRepo.delete).toHaveBeenCalledWith('blocage-uuid');
  });

  // TEST-BLOCAGE-04 — Suppression blocage Airbnb refusée
  it('TEST-BLOCAGE-04: lève ForbiddenException pour blocage AIRBNB', async () => {
    mockRepo.findById.mockResolvedValue({
      id: 'blocage-airbnb', logementId: 'log-uuid', tenantId: 'tenant-A',
      dateDebut: new Date(), dateFin: new Date(), source: SourceBlocage.AIRBNB,
    });

    await expect(useCase.execute('blocage-airbnb', 'tenant-A')).rejects.toThrow(
      new ForbiddenException(
        'Impossible de supprimer un blocage importé depuis une plateforme externe',
      ),
    );
  });
});
