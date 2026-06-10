import { Injectable, Inject, BadRequestException } from '@nestjs/common';
import {
  RESERVATION_REPOSITORY,
  IReservationRepository,
} from '../../domain/ports/reservation.repository.port';

export interface VerifierDisponibiliteCommand {
  logementId: string;
  tenantId: string;
  dateDebut: Date;
  dateFin: Date;
}

export interface DisponibiliteResult {
  disponible: boolean;
  motif?: string;
}

/**
 * CAS D'USAGE — Vérification de disponibilité d'un logement.
 *
 * Ce use-case est 100% métier. Il ne connaît ni TypeORM,
 * ni PostgreSQL, ni HTTP. Il est testable avec un mock du port.
 */
@Injectable()
export class VerifierDisponibiliteUseCase {
  constructor(
    @Inject(RESERVATION_REPOSITORY)
    private readonly reservationRepository: IReservationRepository,
  ) {}

  async execute(command: VerifierDisponibiliteCommand): Promise<DisponibiliteResult> {
    const { logementId, tenantId, dateDebut, dateFin } = command;

    // Règle métier 1 : la date de fin doit être après la date de début
    if (dateFin <= dateDebut) {
      throw new BadRequestException(
        'La date de départ doit être postérieure à la date d\'arrivée',
      );
    }

    // Règle métier 2 : durée minimale de 1 nuit
    const nbNuits = Math.ceil(
      (dateFin.getTime() - dateDebut.getTime()) / (1000 * 60 * 60 * 24),
    );
    if (nbNuits < 1) {
      throw new BadRequestException('La durée minimale de séjour est d\'1 nuit');
    }

    // Règle métier 3 : vérifier l'absence de conflit (réservation ou blocage)
    const conflit = await this.reservationRepository.existsConflict(
      logementId,
      dateDebut,
      dateFin,
    );

    if (conflit) {
      return { disponible: false, motif: 'Ces dates sont déjà réservées ou bloquées' };
    }

    // Règle métier 4 : vérifier l'absence de hold actif
    const holdActif = await this.reservationRepository.existsActiveHold(
      logementId,
      dateDebut,
      dateFin,
    );

    if (holdActif) {
      return {
        disponible: false,
        motif: 'Ces dates sont temporairement réservées par un autre voyageur',
      };
    }

    return { disponible: true };
  }
}
