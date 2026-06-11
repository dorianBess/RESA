import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  ITenantRepository,
  TenantDomain,
  StatutAbonnementValue,
} from '../../domain/ports/tenant.repository.port';
import { TenantEntity, StatutAbonnement } from '../entities/tenant.entity';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class TenantRepository implements ITenantRepository {
  constructor(
    @InjectRepository(TenantEntity)
    private readonly repo: Repository<TenantEntity>,
  ) {}

  async findAll(): Promise<TenantDomain[]> {
    return this.repo.find().then(ts => ts.map(this.toDomain));
  }

  async findById(id: string): Promise<TenantDomain | null> {
    const t = await this.repo.findOne({ where: { id } });
    return t ? this.toDomain(t) : null;
  }

  async emailExists(email: string): Promise<boolean> {
    return (await this.repo.count({ where: { email } })) > 0;
  }

  async create(data: {
    raisonSociale: string;
    email: string;
    motDePasseHash: string;
  }): Promise<TenantDomain> {
    const t = this.repo.create({
      raisonSociale: data.raisonSociale,
      email: data.email,
      motDePasseHash: data.motDePasseHash,
      abonnementStatut: StatutAbonnement.ESSAI,
    });
    return this.toDomain(await this.repo.save(t));
  }

  async update(id: string, data: Partial<TenantDomain>): Promise<TenantDomain | null> {
    const t = await this.repo.findOne({ where: { id } });
    if (!t) return null;
    Object.assign(t, data);
    return this.toDomain(await this.repo.save(t));
  }

  async updateStatut(id: string, statut: StatutAbonnementValue): Promise<TenantDomain | null> {
    const t = await this.repo.findOne({ where: { id } });
    if (!t) return null;
    t.abonnementStatut = statut as StatutAbonnement;
    return this.toDomain(await this.repo.save(t));
  }

  private toDomain(t: TenantEntity): TenantDomain {
    return {
      id: t.id,
      raisonSociale: t.raisonSociale,
      email: t.email,
      abonnementStatut: t.abonnementStatut,
      abonnementDebut: t.abonnementDebut,
      abonnementFin: t.abonnementFin,
      createdAt: t.createdAt,
      updatedAt: t.updatedAt,
    };
  }
}
