import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { IPhotoRepository } from '../../domain/ports/photo.repository.port';
import { PhotoDomain } from '../../domain/ports/logement.repository.port';
import { PhotoEntity } from '../entities/photo.entity';

@Injectable()
export class PhotoRepository implements IPhotoRepository {
  constructor(@InjectRepository(PhotoEntity) private readonly repo: Repository<PhotoEntity>) {}

  async findByLogement(logementId: string, tenantId: string): Promise<PhotoDomain[]> {
    return this.repo.find({ where: { logementId, tenantId }, order: { ordre: 'ASC' } });
  }

  async save(photo: Omit<PhotoDomain, 'id'>): Promise<PhotoDomain> {
    const entity = this.repo.create(photo as any) as unknown as PhotoEntity;
    return this.repo.save(entity) as unknown as Promise<PhotoDomain>;
  }

  async delete(photoId: string, tenantId: string): Promise<void> {
    await this.repo.delete({ id: photoId, tenantId });
  }

  async updateOrdre(photos: { id: string; ordre: number }[]): Promise<void> {
    for (const { id, ordre } of photos) {
      await this.repo.update(id, { ordre });
    }
  }
}
