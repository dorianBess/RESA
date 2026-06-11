import { Injectable, Inject } from '@nestjs/common';
import { LOGEMENT_REPOSITORY, ILogementRepository } from '../../domain/ports/logement.repository.port';

@Injectable()
export class ListerLogementsUseCase {
  constructor(
    @Inject(LOGEMENT_REPOSITORY) private readonly logementRepository: ILogementRepository,
  ) {}

  execute(tenantId: string, opts?: { statut?: string; page?: number; limit?: number }) {
    return this.logementRepository.findAll(tenantId, opts);
  }
}
