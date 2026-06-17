import { Injectable, Inject } from '@nestjs/common';
import {
  PHOTO_REPOSITORY,
  IPhotoRepository,
  STORAGE_SERVICE,
  IStorageService,
} from '../../domain/ports/photo.repository.port';

@Injectable()
export class SupprimerPhotoUseCase {
  constructor(
    @Inject(PHOTO_REPOSITORY)
    private readonly photoRepository: IPhotoRepository,
    @Inject(STORAGE_SERVICE) private readonly storageService: IStorageService,
  ) {}

  async execute(photoId: string, tenantId: string): Promise<void> {
    await this.photoRepository.delete(photoId, tenantId);
  }
}
