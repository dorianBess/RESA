import { SupprimerPhotoUseCase } from './supprimer-photo.use-case';
import { IPhotoRepository, IStorageService } from '../../domain/ports/photo.repository.port';

describe('SupprimerPhotoUseCase', () => {
  let useCase: SupprimerPhotoUseCase;
  let mockPhotoRepo: jest.Mocked<IPhotoRepository>;
  let mockStorageService: jest.Mocked<IStorageService>;

  beforeEach(() => {
    mockPhotoRepo = {
      findByLogement: jest.fn(),
      save: jest.fn(),
      delete: jest.fn(),
      updateOrdre: jest.fn(),
    };
    mockStorageService = {
      upload: jest.fn(),
      delete: jest.fn(),
    };
    useCase = new SupprimerPhotoUseCase(mockPhotoRepo, mockStorageService);
  });

  afterEach(() => jest.clearAllMocks());

  // TEST-PHOTO-SUP-01 — Suppression réussie
  it('TEST-PHOTO-SUP-01: supprime la photo via le repository', async () => {
    mockPhotoRepo.delete.mockResolvedValue();

    await expect(useCase.execute('photo-uuid', 'tenant-A')).resolves.toBeUndefined();
    expect(mockPhotoRepo.delete).toHaveBeenCalledWith('photo-uuid', 'tenant-A');
  });

  // TEST-PHOTO-SUP-02 — Appel avec les bons paramètres
  it('TEST-PHOTO-SUP-02: transmet photoId et tenantId au repository', async () => {
    mockPhotoRepo.delete.mockResolvedValue();

    await useCase.execute('photo-123', 'tenant-B');

    expect(mockPhotoRepo.delete).toHaveBeenCalledWith('photo-123', 'tenant-B');
  });
});
