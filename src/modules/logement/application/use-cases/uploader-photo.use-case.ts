import {
  Injectable,
  Inject,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import {
  LOGEMENT_REPOSITORY,
  ILogementRepository,
} from '../../domain/ports/logement.repository.port';
import {
  PHOTO_REPOSITORY,
  IPhotoRepository,
  STORAGE_SERVICE,
  IStorageService,
} from '../../domain/ports/photo.repository.port';
import { PhotoDomain } from '../../domain/ports/logement.repository.port';

const FORMATS_ACCEPTES = ['image/jpeg', 'image/png', 'image/webp'];
const TAILLE_MAX_OCTETS = 5 * 1024 * 1024; // 5 Mo

export interface UploaderPhotoCommand {
  logementId: string;
  tenantId: string;
  buffer: Buffer;
  originalname: string;
  mimetype: string;
  size: number;
  ordre?: number;
}

@Injectable()
export class UploaderPhotoUseCase {
  constructor(
    @Inject(LOGEMENT_REPOSITORY)
    private readonly logementRepository: ILogementRepository,
    @Inject(PHOTO_REPOSITORY)
    private readonly photoRepository: IPhotoRepository,
    @Inject(STORAGE_SERVICE) private readonly storageService: IStorageService,
  ) {}

  async execute(command: UploaderPhotoCommand): Promise<PhotoDomain> {
    if (!FORMATS_ACCEPTES.includes(command.mimetype)) {
      throw new BadRequestException(
        'Format non supporté. Formats acceptés : jpg, png, webp',
      );
    }
    if (command.size > TAILLE_MAX_OCTETS) {
      throw new BadRequestException(
        'Fichier trop volumineux. Taille maximale : 5Mo',
      );
    }
    const logement = await this.logementRepository.findById(
      command.logementId,
      command.tenantId,
    );
    if (!logement) throw new NotFoundException('Logement introuvable');

    const url = await this.storageService.upload(
      command.buffer,
      command.originalname,
      command.mimetype,
    );
    return this.photoRepository.save({
      logementId: command.logementId,
      tenantId: command.tenantId,
      url,
      ordre: command.ordre ?? 0,
    });
  }
}
