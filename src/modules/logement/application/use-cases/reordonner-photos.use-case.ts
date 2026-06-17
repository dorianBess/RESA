import { Injectable, Inject } from '@nestjs/common';
import {
  PHOTO_REPOSITORY,
  IPhotoRepository,
} from '../../domain/ports/photo.repository.port';

@Injectable()
export class ReordonnerPhotosUseCase {
  constructor(
    @Inject(PHOTO_REPOSITORY)
    private readonly photoRepository: IPhotoRepository,
  ) {}

  async execute(ordre: string[]): Promise<void> {
    const updates = ordre.map((id, index) => ({ id, ordre: index }));
    await this.photoRepository.updateOrdre(updates);
  }
}
