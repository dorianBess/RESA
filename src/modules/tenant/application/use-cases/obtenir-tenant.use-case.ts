import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import {
  TENANT_REPOSITORY,
  ITenantRepository,
  TenantDomain,
} from '../../domain/ports/tenant.repository.port';

@Injectable()
export class ObtenirTenantUseCase {
  constructor(
    @Inject(TENANT_REPOSITORY)
    private readonly tenantRepository: ITenantRepository,
  ) {}

  async execute(id: string): Promise<TenantDomain> {
    const tenant = await this.tenantRepository.findById(id);
    if (!tenant) throw new NotFoundException('Tenant introuvable');
    return tenant;
  }
}
