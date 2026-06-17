import { Injectable, Inject, ConflictException } from '@nestjs/common';
import {
  BLOCAGE_REPOSITORY,
  IBlocageRepository,
  BlocageDomain,
  SourceBlocage,
} from '../../domain/ports/blocage.repository.port';

export interface CreerBlocageCommand {
  logementId: string;
  tenantId: string;
  dateDebut: Date;
  dateFin: Date;
  motif?: string;
}

@Injectable()
export class CreerBlocageUseCase {
  constructor(
    @Inject(BLOCAGE_REPOSITORY)
    private readonly blocageRepository: IBlocageRepository,
  ) {}

  async execute(command: CreerBlocageCommand): Promise<BlocageDomain> {
    const conflict = await this.blocageRepository.existsConflictWithReservation(
      command.logementId,
      command.dateDebut,
      command.dateFin,
    );
    if (conflict) {
      throw new ConflictException(
        'Ces dates chevauchent une réservation existante',
      );
    }
    return this.blocageRepository.create({
      logementId: command.logementId,
      tenantId: command.tenantId,
      dateDebut: command.dateDebut,
      dateFin: command.dateFin,
      source: SourceBlocage.MANUEL,
      motif: command.motif,
    });
  }
}
