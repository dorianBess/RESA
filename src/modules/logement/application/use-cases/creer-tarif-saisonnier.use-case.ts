import { Injectable, Inject, BadRequestException } from '@nestjs/common';
import { TARIF_REPOSITORY, ITarifRepository } from '../../domain/ports/tarif.repository.port';
import { TarifSaisonnierDomain } from '../../domain/ports/logement.repository.port';

export interface CreerTarifSaisonnierCommand {
  logementId: string;
  tenantId: string;
  nom?: string;
  dateDebut: Date;
  dateFin: Date;
  prixParNuit: number;
  priorite?: number;
}

@Injectable()
export class CreerTarifSaisonnierUseCase {
  constructor(
    @Inject(TARIF_REPOSITORY) private readonly tarifRepository: ITarifRepository,
  ) {}

  async execute(command: CreerTarifSaisonnierCommand): Promise<TarifSaisonnierDomain> {
    if (command.dateFin <= command.dateDebut) {
      throw new BadRequestException('La date de fin doit être postérieure à la date de début');
    }
    if (command.prixParNuit <= 0) {
      throw new BadRequestException('Le prix doit être supérieur à 0');
    }
    return this.tarifRepository.createSaisonnier(command.logementId, command.tenantId, {
      nom: command.nom ?? '',
      dateDebut: command.dateDebut,
      dateFin: command.dateFin,
      prixParNuit: command.prixParNuit,
      priorite: command.priorite ?? 1,
    });
  }
}
