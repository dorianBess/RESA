import {
  Injectable,
  Inject,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import {
  RESERVATION_REPOSITORY,
  IReservationRepository,
  ReservationDomain,
  StatutReservation,
} from '../../domain/ports/reservation.repository.port';

@Injectable()
export class AnnulerReservationUseCase {
  constructor(
    @Inject(RESERVATION_REPOSITORY)
    private readonly reservationRepository: IReservationRepository,
  ) {}

  async execute(id: string, tenantId: string): Promise<ReservationDomain> {
    const reservation = await this.reservationRepository.findById(id, tenantId);
    if (!reservation) throw new NotFoundException('Réservation introuvable');

    if (reservation.statut === StatutReservation.ANNULEE) {
      throw new ConflictException('Cette réservation est déjà annulée');
    }

    await this.reservationRepository.updateStatut(
      id,
      tenantId,
      StatutReservation.ANNULEE,
    );
    return { ...reservation, statut: StatutReservation.ANNULEE };
  }
}
