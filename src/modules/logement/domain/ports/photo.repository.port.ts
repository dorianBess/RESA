import { PhotoDomain } from './logement.repository.port';

export const PHOTO_REPOSITORY = Symbol('PHOTO_REPOSITORY');
export const STORAGE_SERVICE = Symbol('STORAGE_SERVICE');

export interface IPhotoRepository {
  findByLogement(logementId: string, tenantId: string): Promise<PhotoDomain[]>;
  save(photo: Omit<PhotoDomain, 'id'>): Promise<PhotoDomain>;
  delete(photoId: string, tenantId: string): Promise<void>;
  updateOrdre(photos: { id: string; ordre: number }[]): Promise<void>;
}

export interface IStorageService {
  upload(buffer: Buffer, filename: string, mimetype: string): Promise<string>;
  delete(url: string): Promise<void>;
}
