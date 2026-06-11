import { Injectable, Inject, BadRequestException } from '@nestjs/common';
import { TARIF_REPOSITORY, ITarifRepository } from '../../domain/ports/tarif.repository.port';
import { TarifBaseDomain } from '../../domain/ports/logement.repository.port';

export interface UpsertTarifBaseCommand {
  logementId: string;
  tenantId: string;
  prixParNuit: number;
  prixSemaine?: number;
}

@Injectable()
export class UpsertTarifBaseUseCase {
  constructor(
    @Inject(TARIF_REPOSITORY) private readonly tarifRepository: ITarifRepository,
  ) {}

  async execute(command: UpsertTarifBaseCommand): Promise<TarifBaseDomain> {
    if (command.prixParNuit <= 0) {
      throw new BadRequestException('Le prix doit être supérieur à 0');
    }
    return this.tarifRepository.upsertBase(command.logementId, command.tenantId, {
      prixParNuit: command.prixParNuit,
      prixSemaine: command.prixSemaine,
    });
  }
}
