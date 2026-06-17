import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan } from 'typeorm';
import {
  IReservationRepository,
  ReservationDomain,
  ReservationHoldDomain,
  StatutReservation,
} from '../../domain/ports/reservation.repository.port';
import { ReservationEntity } from '../entities/reservation.entity';
import { ReservationHoldEntity } from '../entities/reservation-hold.entity';

@Injectable()
export class ReservationRepository implements IReservationRepository {
  constructor(
    @InjectRepository(ReservationEntity)
    private readonly repo: Repository<ReservationEntity>,
    @InjectRepository(ReservationHoldEntity)
    private readonly holdRepo: Repository<ReservationHoldEntity>,
  ) {}

  async findById(
    id: string,
    tenantId: string,
  ): Promise<ReservationDomain | null> {
    const r = await this.repo.findOne({ where: { id, tenantId } });
    return r ? this.toDomain(r) : null;
  }

  async findByLogement(
    logementId: string,
    tenantId: string,
  ): Promise<ReservationDomain[]> {
    const where: Record<string, string> = { tenantId };
    if (logementId) where.logementId = logementId;
    return (await this.repo.find({ where })).map(this.toDomain);
  }

  async existsConflict(
    logementId: string,
    debut: Date,
    fin: Date,
    excludeId?: string,
  ): Promise<boolean> {
    const qb = this.repo
      .createQueryBuilder('r')
      .where('r.logementId = :logementId', { logementId })
      .andWhere('r.statut NOT IN (:...statuts)', {
        statuts: [StatutReservation.ANNULEE, StatutReservation.REMBOURSEE],
      })
      .andWhere('r.dateDebut < :fin', { fin })
      .andWhere('r.dateFin > :debut', { debut });
    if (excludeId) qb.andWhere('r.id != :excludeId', { excludeId });
    return (await qb.getCount()) > 0;
  }

  async save(reservation: ReservationDomain): Promise<ReservationDomain> {
    const entity = this.repo.create({
      ...reservation,
    } as any) as unknown as ReservationEntity;
    return this.toDomain(await this.repo.save(entity));
  }

  async updateStatut(
    id: string,
    tenantId: string,
    statut: string,
  ): Promise<void> {
    await this.repo.update(
      { id, tenantId },
      { statut: statut as StatutReservation },
    );
  }

  async createHold(
    hold: ReservationHoldDomain,
  ): Promise<ReservationHoldDomain> {
    const entity = this.holdRepo.create({ ...hold } as any);
    const saved = await this.holdRepo.save(entity);
    return saved as unknown as ReservationHoldDomain;
  }

  async deleteExpiredHolds(): Promise<void> {
    await this.holdRepo.delete({
      statut: 'ACTIF',
      expiresAt: LessThan(new Date()) as any,
    });
  }

  async existsActiveHold(
    logementId: string,
    debut: Date,
    fin: Date,
  ): Promise<boolean> {
    const count = await this.holdRepo
      .createQueryBuilder('h')
      .where('h.logementId = :logementId', { logementId })
      .andWhere('h.statut = :statut', { statut: 'ACTIF' })
      .andWhere('h.expiresAt > :now', { now: new Date() })
      .andWhere('h.dateDebut < :fin', { fin })
      .andWhere('h.dateFin > :debut', { debut })
      .getCount();
    return count > 0;
  }

  private toDomain(r: ReservationEntity): ReservationDomain {
    return {
      id: r.id,
      tenantId: r.tenantId,
      logementId: r.logementId,
      dateDebut: r.dateDebut,
      dateFin: r.dateFin,
      nbNuits: r.nbNuits,
      nbPersonnes: r.nbPersonnes,
      montantTotal: Number(r.montantTotal),
      montantAcompte: r.montantAcompte ? Number(r.montantAcompte) : undefined,
      statut: r.statut,
      voyageurNom: r.voyageurNom,
      voyageurPrenom: r.voyageurPrenom,
      voyageurEmail: r.voyageurEmail,
      voyageurTelephone: r.voyageurTelephone ?? undefined,
      notes: r.notes ?? undefined,
      createdAt: r.createdAt,
    };
  }
}
