import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  ILogementRepository,
  LogementDomain,
} from '../../domain/ports/logement.repository.port';
import { LogementEntity } from '../entities/logement.entity';
import { ReservationEntity } from '@modules/reservation/infrastructure/entities/reservation.entity';
import { StatutReservation } from '@modules/reservation/domain/ports/reservation.repository.port';

@Injectable()
export class LogementRepository implements ILogementRepository {
  constructor(
    @InjectRepository(LogementEntity)
    private readonly repo: Repository<LogementEntity>,
    @InjectRepository(ReservationEntity)
    private readonly resaRepo: Repository<ReservationEntity>,
  ) {}

  async findAll(
    tenantId: string,
    opts?: { statut?: string; page?: number; limit?: number },
  ) {
    const qb = this.repo
      .createQueryBuilder('l')
      .where('l.tenantId = :tenantId', { tenantId });
    if (opts?.statut)
      qb.andWhere('l.statut = :statut', { statut: opts.statut });
    const limit = opts?.limit ?? 20;
    const page = opts?.page ?? 1;
    qb.skip((page - 1) * limit).take(limit);
    const [data, total] = await qb.getManyAndCount();
    return { data: data.map(this.toDomain), total };
  }

  async findById(id: string, tenantId: string): Promise<LogementDomain | null> {
    const l = await this.repo.findOne({ where: { id, tenantId } });
    return l ? this.toDomain(l) : null;
  }

  async findAllWithoutTenantFilter(id: string): Promise<LogementDomain | null> {
    const l = await this.repo.findOne({ where: { id } });
    return l ? this.toDomain(l) : null;
  }

  async create(
    data: Omit<LogementDomain, 'id' | 'createdAt' | 'updatedAt'>,
  ): Promise<LogementDomain> {
    const entity = this.repo.create(data as any) as unknown as LogementEntity;
    return this.toDomain(await this.repo.save(entity));
  }

  async update(
    id: string,
    tenantId: string,
    data: Partial<LogementDomain>,
  ): Promise<LogementDomain | null> {
    const l = await this.repo.findOne({ where: { id, tenantId } });
    if (!l) return null;
    Object.assign(l, data);
    return this.toDomain(await this.repo.save(l));
  }

  async hasReservationsFutures(id: string): Promise<boolean> {
    const count = await this.resaRepo
      .createQueryBuilder('r')
      .where('r.logementId = :id', { id })
      .andWhere('r.statut = :statut', { statut: StatutReservation.CONFIRMEE })
      .andWhere('r.dateFin > :now', { now: new Date() })
      .getCount();
    return count > 0;
  }

  private toDomain(l: LogementEntity): LogementDomain {
    return {
      id: l.id,
      tenantId: l.tenantId,
      nom: l.nom,
      description: l.description ?? undefined,
      capacite: l.capacite,
      statut: l.statut,
      urlIcalAirbnb: l.urlIcalAirbnb ?? undefined,
      urlIcalBooking: l.urlIcalBooking ?? undefined,
      createdAt: l.createdAt,
      updatedAt: l.updatedAt,
    };
  }
}
