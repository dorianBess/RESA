import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  IAuthRepository,
  ITenantCredentials,
} from '../../domain/ports/auth.repository.port';
import {
  TenantEntity,
  StatutAbonnement,
} from '@modules/tenant/infrastructure/entities/tenant.entity';

@Injectable()
export class AuthRepository implements IAuthRepository {
  constructor(
    @InjectRepository(TenantEntity)
    private readonly repo: Repository<TenantEntity>,
  ) {}

  async findByEmail(email: string): Promise<ITenantCredentials | null> {
    const tenant = await this.repo.findOne({ where: { email } });
    if (!tenant) return null;
    return {
      id: tenant.id,
      email: tenant.email,
      motDePasseHash: tenant.motDePasseHash,
      raisonSociale: tenant.raisonSociale,
      abonnementStatut: tenant.abonnementStatut,
    };
  }

  async emailExists(email: string): Promise<boolean> {
    const count = await this.repo.count({ where: { email } });
    return count > 0;
  }

  async createTenant(data: {
    raisonSociale: string;
    email: string;
    motDePasseHash: string;
  }): Promise<ITenantCredentials> {
    const tenant = this.repo.create({
      raisonSociale: data.raisonSociale,
      email: data.email,
      motDePasseHash: data.motDePasseHash,
      abonnementStatut: StatutAbonnement.ESSAI,
    });
    const saved = await this.repo.save(tenant);
    return {
      id: saved.id,
      email: saved.email,
      motDePasseHash: saved.motDePasseHash,
      raisonSociale: saved.raisonSociale,
      abonnementStatut: saved.abonnementStatut,
    };
  }
}
