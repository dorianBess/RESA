import { ReordonnerPhotosUseCase } from './reordonner-photos.use-case';
import { IPhotoRepository } from '../../domain/ports/photo.repository.port';

describe('ReordonnerPhotosUseCase', () => {
  let useCase: ReordonnerPhotosUseCase;
  let mockPhotoRepo: jest.Mocked<IPhotoRepository>;

  beforeEach(() => {
    mockPhotoRepo = {
      findByLogement: jest.fn(), save: jest.fn(), delete: jest.fn(), updateOrdre: jest.fn(),
    };
    useCase = new ReordonnerPhotosUseCase(mockPhotoRepo);
  });

  afterEach(() => jest.clearAllMocks());

  // TEST-PHOTO-04 — Réordonnancement
  it('TEST-PHOTO-04: réordonne C→0, A→1, B→2', async () => {
    mockPhotoRepo.updateOrdre.mockResolvedValue();

    await useCase.execute(['C', 'A', 'B']);

    expect(mockPhotoRepo.updateOrdre).toHaveBeenCalledWith([
      { id: 'C', ordre: 0 },
      { id: 'A', ordre: 1 },
      { id: 'B', ordre: 2 },
    ]);
  });
});
