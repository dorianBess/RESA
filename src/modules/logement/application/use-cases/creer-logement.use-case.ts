import { Injectable, Inject, BadRequestException } from '@nestjs/common';
import {
  LOGEMENT_REPOSITORY,
  ILogementRepository,
  LogementDomain,
  StatutLogement,
} from '../../domain/ports/logement.repository.port';

export interface CreerLogementCommand {
  tenantId: string;
  nom: string;
  description?: string;
  capacite: number;
}

@Injectable()
export class CreerLogementUseCase {
  constructor(
    @Inject(LOGEMENT_REPOSITORY) private readonly logementRepository: ILogementRepository,
  ) {}

  async execute(command: CreerLogementCommand): Promise<LogementDomain> {
    if (!command.nom) {
      throw new BadRequestException('Le champ nom est obligatoire');
    }
    if (command.capacite <= 0) {
      throw new BadRequestException('La capacité doit être supérieure à 0');
    }
    return this.logementRepository.create({
      tenantId: command.tenantId,
      nom: command.nom,
      description: command.description,
      capacite: command.capacite,
      statut: StatutLogement.ACTIF,
    });
  }
}
