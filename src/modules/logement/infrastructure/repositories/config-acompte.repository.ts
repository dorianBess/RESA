import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IConfigAcompteRepository } from '../../domain/ports/config-acompte.repository.port';
import { ConfigAcompteDomain } from '../../domain/ports/logement.repository.port';
import { ConfigAcompteEntity } from '../entities/config-acompte.entity';

@Injectable()
export class ConfigAcompteRepository implements IConfigAcompteRepository {
  constructor(
    @InjectRepository(ConfigAcompteEntity)
    private readonly repo: Repository<ConfigAcompteEntity>,
  ) {}

  async findByLogement(
    logementId: string,
  ): Promise<ConfigAcompteDomain | null> {
    const c = await this.repo.findOne({ where: { logementId } });
    return c ? this.toDomain(c) : null;
  }

  async upsert(
    logementId: string,
    tenantId: string,
    data: { actif: boolean; pourcentage?: number; delaiSoldeJours?: number },
  ): Promise<ConfigAcompteDomain> {
    let c = await this.repo.findOne({ where: { logementId } });
    if (c) {
      Object.assign(c, data);
    } else {
      c = this.repo.create({
        logementId,
        tenantId,
        ...data,
      } as any) as unknown as ConfigAcompteEntity;
    }
    return this.toDomain(await this.repo.save(c));
  }

  private toDomain(c: ConfigAcompteEntity): ConfigAcompteDomain {
    return {
      id: c.id,
      logementId: c.logementId,
      actif: c.actif,
      pourcentage: c.pourcentage,
      delaiSoldeJours: c.delaiSoldeJours,
    };
  }
}
