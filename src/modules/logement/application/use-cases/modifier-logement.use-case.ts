import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { LOGEMENT_REPOSITORY, ILogementRepository, LogementDomain } from '../../domain/ports/logement.repository.port';

export interface ModifierLogementCommand {
  id: string;
  tenantId: string;
  data: Partial<Pick<LogementDomain, 'nom' | 'description' | 'capacite'>>;
}

@Injectable()
export class ModifierLogementUseCase {
  constructor(
    @Inject(LOGEMENT_REPOSITORY) private readonly logementRepository: ILogementRepository,
  ) {}

  async execute(command: ModifierLogementCommand): Promise<LogementDomain> {
    const updated = await this.logementRepository.update(command.id, command.tenantId, command.data);
    if (!updated) throw new NotFoundException('Logement introuvable');
    return updated;
  }
}
