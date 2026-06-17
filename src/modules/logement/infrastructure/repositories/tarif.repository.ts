import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ITarifRepository } from '../../domain/ports/tarif.repository.port';
import {
  TarifBaseDomain,
  TarifSaisonnierDomain,
} from '../../domain/ports/logement.repository.port';
import { TarifBaseEntity } from '../entities/tarif-base.entity';
import { TarifSaisonnierEntity } from '../entities/tarif-saisonnier.entity';

@Injectable()
export class TarifRepository implements ITarifRepository {
  constructor(
    @InjectRepository(TarifBaseEntity)
    private readonly baseRepo: Repository<TarifBaseEntity>,
    @InjectRepository(TarifSaisonnierEntity)
    private readonly saisonnierRepo: Repository<TarifSaisonnierEntity>,
  ) {}

  async findBase(logementId: string): Promise<TarifBaseDomain | null> {
    const t = await this.baseRepo.findOne({ where: { logementId } });
    if (!t) return null;
    return {
      id: t.id,
      logementId: t.logementId,
      prixParNuit: Number(t.prixParNuit),
      prixSemaine: t.prixSemaine ? Number(t.prixSemaine) : undefined,
    };
  }

  async upsertBase(
    logementId: string,
    tenantId: string,
    data: { prixParNuit: number; prixSemaine?: number },
  ): Promise<TarifBaseDomain> {
    let t = await this.baseRepo.findOne({ where: { logementId } });
    if (t) {
      Object.assign(t, data);
    } else {
      t = this.baseRepo.create({
        logementId,
        tenantId,
        ...data,
      } as any) as unknown as TarifBaseEntity;
    }
    const saved = await this.baseRepo.save(t);
    return {
      id: saved.id,
      logementId: saved.logementId,
      prixParNuit: Number(saved.prixParNuit),
      prixSemaine: saved.prixSemaine ? Number(saved.prixSemaine) : undefined,
    };
  }

  async findSaisonniers(logementId: string): Promise<TarifSaisonnierDomain[]> {
    return (await this.saisonnierRepo.find({ where: { logementId } })).map(
      this.toSaisonnierDomain,
    );
  }

  async createSaisonnier(
    logementId: string,
    tenantId: string,
    data: Omit<TarifSaisonnierDomain, 'id' | 'logementId'>,
  ): Promise<TarifSaisonnierDomain> {
    const entity = this.saisonnierRepo.create({
      logementId,
      tenantId,
      ...data,
    } as any) as unknown as TarifSaisonnierEntity;
    return this.toSaisonnierDomain(await this.saisonnierRepo.save(entity));
  }

  async updateSaisonnier(
    id: string,
    tenantId: string,
    data: Partial<TarifSaisonnierDomain>,
  ): Promise<TarifSaisonnierDomain | null> {
    const t = await this.saisonnierRepo.findOne({ where: { id, tenantId } });
    if (!t) return null;
    Object.assign(t, data);
    return this.toSaisonnierDomain(await this.saisonnierRepo.save(t));
  }

  async deleteSaisonnier(id: string, tenantId: string): Promise<boolean> {
    const result = await this.saisonnierRepo.delete({ id, tenantId });
    return (result.affected ?? 0) > 0;
  }

  async findApplicable(
    logementId: string,
    dateDebut: Date,
    dateFin: Date,
  ): Promise<TarifSaisonnierDomain | null> {
    const t = await this.saisonnierRepo
      .createQueryBuilder('ts')
      .where('ts.logementId = :logementId', { logementId })
      .andWhere('ts.dateDebut <= :dateDebut', { dateDebut })
      .andWhere('ts.dateFin >= :dateFin', { dateFin })
      .orderBy('ts.priorite', 'DESC')
      .getOne();
    return t ? this.toSaisonnierDomain(t) : null;
  }

  private toSaisonnierDomain(t: TarifSaisonnierEntity): TarifSaisonnierDomain {
    return {
      id: t.id,
      logementId: t.logementId,
      nom: t.nom,
      dateDebut: t.dateDebut,
      dateFin: t.dateFin,
      prixParNuit: Number(t.prixParNuit),
      priorite: t.priorite,
    };
  }
}
