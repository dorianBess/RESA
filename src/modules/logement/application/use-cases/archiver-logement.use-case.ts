import { Injectable, Inject, NotFoundException, ConflictException } from '@nestjs/common';
import {
  LOGEMENT_REPOSITORY,
  ILogementRepository,
  LogementDomain,
  StatutLogement,
} from '../../domain/ports/logement.repository.port';

@Injectable()
export class ArchiverLogementUseCase {
  constructor(
    @Inject(LOGEMENT_REPOSITORY) private readonly logementRepository: ILogementRepository,
  ) {}

  async execute(id: string, tenantId: string): Promise<LogementDomain> {
    const logement = await this.logementRepository.findById(id, tenantId);
    if (!logement) throw new NotFoundException('Logement introuvable');

    const hasReservations = await this.logementRepository.hasReservationsFutures(id);
    if (hasReservations) {
      throw new ConflictException(
        "Impossible d'archiver un logement avec des réservations à venir",
      );
    }

    const updated = await this.logementRepository.update(id, tenantId, {
      statut: StatutLogement.ARCHIVE,
    });
    return updated!;
  }
}
