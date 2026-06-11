import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IBlocageRepository, BlocageDomain, SourceBlocage } from '../../domain/ports/blocage.repository.port';
import { BlocageDatesEntity } from '../entities/blocage-dates.entity';
import { ReservationEntity } from '@modules/reservation/infrastructure/entities/reservation.entity';
import { StatutReservation } from '@modules/reservation/domain/ports/reservation.repository.port';

@Injectable()
export class BlocageRepository implements IBlocageRepository {
  constructor(
    @InjectRepository(BlocageDatesEntity) private readonly repo: Repository<BlocageDatesEntity>,
    @InjectRepository(ReservationEntity) private readonly resaRepo: Repository<ReservationEntity>,
  ) {}

  async findByLogement(logementId: string, tenantId: string, opts?: { dateDebut?: Date; dateFin?: Date; source?: string }): Promise<BlocageDomain[]> {
    const qb = this.repo.createQueryBuilder('b').where('b.logementId = :logementId AND b.tenantId = :tenantId', { logementId, tenantId });
    if (opts?.source) qb.andWhere('b.source = :source', { source: opts.source });
    if (opts?.dateDebut) qb.andWhere('b.dateFin >= :dateDebut', { dateDebut: opts.dateDebut });
    if (opts?.dateFin) qb.andWhere('b.dateDebut <= :dateFin', { dateFin: opts.dateFin });
    return (await qb.getMany()).map(this.toDomain);
  }

  async findById(id: string): Promise<BlocageDomain | null> {
    const b = await this.repo.findOne({ where: { id } });
    return b ? this.toDomain(b) : null;
  }

  async existsConflictWithReservation(logementId: string, dateDebut: Date, dateFin: Date): Promise<boolean> {
    const count = await this.resaRepo.createQueryBuilder('r')
      .where('r.logementId = :logementId', { logementId })
      .andWhere('r.statut = :statut', { statut: StatutReservation.CONFIRMEE })
      .andWhere('r.dateDebut < :dateFin', { dateFin })
      .andWhere('r.dateFin > :dateDebut', { dateDebut })
      .getCount();
    return count > 0;
  }

  async existsConflict(logementId: string, dateDebut: Date, dateFin: Date): Promise<boolean> {
    const count = await this.repo.createQueryBuilder('b')
      .where('b.logementId = :logementId', { logementId })
      .andWhere('b.dateDebut < :dateFin', { dateFin })
      .andWhere('b.dateFin > :dateDebut', { dateDebut })
      .getCount();
    return count > 0;
  }

  async create(data: Omit<BlocageDomain, 'id' | 'createdAt'>): Promise<BlocageDomain> {
    const entity = this.repo.create(data as any) as unknown as BlocageDatesEntity;
    return this.toDomain(await this.repo.save(entity));
  }

  async delete(id: string): Promise<void> {
    await this.repo.delete(id);
  }

  async findByDateRange(logementId: string, dateDebut: Date, dateFin: Date, source?: SourceBlocage): Promise<BlocageDomain[]> {
    const qb = this.repo.createQueryBuilder('b')
      .where('b.logementId = :logementId', { logementId })
      .andWhere('b.dateDebut = :dateDebut', { dateDebut })
      .andWhere('b.dateFin = :dateFin', { dateFin });
    if (source) qb.andWhere('b.source = :source', { source });
    return (await qb.getMany()).map(this.toDomain);
  }

  private toDomain(b: BlocageDatesEntity): BlocageDomain {
    return { id: b.id, logementId: b.logementId, tenantId: b.tenantId, dateDebut: b.dateDebut, dateFin: b.dateFin, source: b.source, motif: b.motif ?? undefined, statut: b.statut, createdAt: b.createdAt };
  }
}
