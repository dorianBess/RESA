import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IDisponibiliteRepository } from '../../domain/ports/disponibilite.repository.port';
import { ReservationEntity } from '@modules/reservation/infrastructure/entities/reservation.entity';
import { ReservationHoldEntity } from '@modules/reservation/infrastructure/entities/reservation-hold.entity';
import { StatutReservation } from '@modules/reservation/domain/ports/reservation.repository.port';

@Injectable()
export class DisponibiliteRepository implements IDisponibiliteRepository {
  constructor(
    @InjectRepository(ReservationEntity) private readonly resaRepo: Repository<ReservationEntity>,
    @InjectRepository(ReservationHoldEntity) private readonly holdRepo: Repository<ReservationHoldEntity>,
  ) {}

  async existsConflict(logementId: string, dateDebut: Date, dateFin: Date): Promise<boolean> {
    const count = await this.resaRepo.createQueryBuilder('r')
      .where('r.logementId = :logementId', { logementId })
      .andWhere('r.statut NOT IN (:...statuts)', { statuts: [StatutReservation.ANNULEE, StatutReservation.REMBOURSEE] })
      .andWhere('r.dateDebut < :dateFin', { dateFin })
      .andWhere('r.dateFin > :dateDebut', { dateDebut })
      .getCount();
    return count > 0;
  }

  async existsActiveHold(logementId: string, dateDebut: Date, dateFin: Date): Promise<boolean> {
    const count = await this.holdRepo.createQueryBuilder('h')
      .where('h.logementId = :logementId', { logementId })
      .andWhere('h.statut = :statut', { statut: 'ACTIF' })
      .andWhere('h.expiresAt > :now', { now: new Date() })
      .andWhere('h.dateDebut < :dateFin', { dateFin })
      .andWhere('h.dateFin > :dateDebut', { dateDebut })
      .getCount();
    return count > 0;
  }
}
