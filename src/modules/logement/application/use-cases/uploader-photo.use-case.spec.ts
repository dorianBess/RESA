import { BadRequestException } from '@nestjs/common';
import { UploaderPhotoUseCase } from './uploader-photo.use-case';
import {
  ILogementRepository,
  StatutLogement,
} from '../../domain/ports/logement.repository.port';
import {
  IPhotoRepository,
  IStorageService,
} from '../../domain/ports/photo.repository.port';

describe('UploaderPhotoUseCase', () => {
  let useCase: UploaderPhotoUseCase;
  let mockLogementRepo: jest.Mocked<ILogementRepository>;
  let mockPhotoRepo: jest.Mocked<IPhotoRepository>;
  let mockStorage: jest.Mocked<IStorageService>;

  const logement = {
    id: 'logement-uuid',
    tenantId: 'tenant-A',
    nom: 'Gîte',
    capacite: 4,
    statut: StatutLogement.ACTIF,
  };

  const baseCmd = {
    logementId: 'logement-uuid',
    tenantId: 'tenant-A',
    buffer: Buffer.from('fake-image'),
    originalname: 'photo.jpg',
    mimetype: 'image/jpeg',
    size: 2 * 1024 * 1024, // 2Mo
  };

  beforeEach(() => {
    mockLogementRepo = {
      findAll: jest.fn(),
      findById: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      hasReservationsFutures: jest.fn(),
      findAllWithoutTenantFilter: jest.fn(),
    };
    mockPhotoRepo = {
      findByLogement: jest.fn(),
      save: jest.fn(),
      delete: jest.fn(),
      updateOrdre: jest.fn(),
    };
    mockStorage = { upload: jest.fn(), delete: jest.fn() };
    useCase = new UploaderPhotoUseCase(
      mockLogementRepo,
      mockPhotoRepo,
      mockStorage,
    );
  });

  afterEach(() => jest.clearAllMocks());

  // TEST-PHOTO-01 — Upload réussi
  it('TEST-PHOTO-01: retourne photo avec URL S3 et ordre 0', async () => {
    mockLogementRepo.findById.mockResolvedValue(logement);
    mockStorage.upload.mockResolvedValue(
      'https://s3.eu-west-3.amazonaws.com/resa-dev/photo.jpg',
    );
    mockPhotoRepo.save.mockResolvedValue({
      id: 'photo-uuid',
      logementId: 'logement-uuid',
      tenantId: 'tenant-A',
      url: 'https://s3.eu-west-3.amazonaws.com/resa-dev/photo.jpg',
      ordre: 0,
    });

    const result = await useCase.execute(baseCmd);

    expect(result.url).toContain('s3');
    expect(result.ordre).toBe(0);
  });

  // TEST-PHOTO-02 — Format non supporté
  it('TEST-PHOTO-02: lève BadRequestException "Format non supporté"', async () => {
    await expect(
      useCase.execute({
        ...baseCmd,
        mimetype: 'application/pdf',
        originalname: 'doc.pdf',
      }),
    ).rejects.toThrow(
      new BadRequestException(
        'Format non supporté. Formats acceptés : jpg, png, webp',
      ),
    );
  });

  // TEST-PHOTO-03 — Fichier trop lourd
  it('TEST-PHOTO-03: lève BadRequestException "Fichier trop volumineux"', async () => {
    await expect(
      useCase.execute({ ...baseCmd, size: 10 * 1024 * 1024 }),
    ).rejects.toThrow(
      new BadRequestException('Fichier trop volumineux. Taille maximale : 5Mo'),
    );
  });
});
