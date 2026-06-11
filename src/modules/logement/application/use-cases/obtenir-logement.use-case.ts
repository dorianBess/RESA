import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { LOGEMENT_REPOSITORY, ILogementRepository, LogementDomain } from '../../domain/ports/logement.repository.port';

@Injectable()
export class ObtenirLogementUseCase {
  constructor(
    @Inject(LOGEMENT_REPOSITORY) private readonly logementRepository: ILogementRepository,
  ) {}

  async execute(id: string, tenantId: string): Promise<LogementDomain> {
    const logement = await this.logementRepository.findById(id, tenantId);
    if (!logement) throw new NotFoundException('Logement introuvable');
    return logement;
  }
}
