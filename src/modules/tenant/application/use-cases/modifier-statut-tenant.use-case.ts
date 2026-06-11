import { Injectable, Inject, BadRequestException, NotFoundException } from '@nestjs/common';
import {
  TENANT_REPOSITORY,
  ITenantRepository,
  TenantDomain,
  StatutAbonnementValue,
} from '../../domain/ports/tenant.repository.port';

const STATUTS_VALIDES: StatutAbonnementValue[] = ['ESSAI', 'ACTIF', 'SUSPENDU', 'RESILIE'];

@Injectable()
export class ModifierStatutTenantUseCase {
  constructor(
    @Inject(TENANT_REPOSITORY) private readonly tenantRepository: ITenantRepository,
  ) {}

  async execute(id: string, statut: string): Promise<TenantDomain> {
    if (!STATUTS_VALIDES.includes(statut as StatutAbonnementValue)) {
      throw new BadRequestException('Statut invalide');
    }
    const tenant = await this.tenantRepository.updateStatut(id, statut as StatutAbonnementValue);
    if (!tenant) {
      throw new NotFoundException('Tenant introuvable');
    }
    return tenant;
  }
}
