import { Injectable, Inject, BadRequestException } from '@nestjs/common';
import {
  CONFIG_ACOMPTE_REPOSITORY,
  IConfigAcompteRepository,
} from '../../domain/ports/config-acompte.repository.port';
import { ConfigAcompteDomain } from '../../domain/ports/logement.repository.port';

export interface UpsertConfigAcompteCommand {
  logementId: string;
  tenantId: string;
  actif: boolean;
  pourcentage?: number;
  delaiSoldeJours?: number;
}

@Injectable()
export class UpsertConfigAcompteUseCase {
  constructor(
    @Inject(CONFIG_ACOMPTE_REPOSITORY)
    private readonly repo: IConfigAcompteRepository,
  ) {}

  async execute(
    command: UpsertConfigAcompteCommand,
  ): Promise<ConfigAcompteDomain> {
    if (
      command.pourcentage !== undefined &&
      (command.pourcentage < 1 || command.pourcentage > 99)
    ) {
      throw new BadRequestException(
        'Le pourcentage doit être compris entre 1 et 99',
      );
    }
    return this.repo.upsert(command.logementId, command.tenantId, {
      actif: command.actif,
      pourcentage: command.pourcentage,
      delaiSoldeJours: command.delaiSoldeJours,
    });
  }
}
