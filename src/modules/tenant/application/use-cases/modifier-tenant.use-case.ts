import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import {
  TENANT_REPOSITORY,
  ITenantRepository,
  TenantDomain,
} from '../../domain/ports/tenant.repository.port';

@Injectable()
export class ModifierTenantUseCase {
  constructor(
    @Inject(TENANT_REPOSITORY)
    private readonly tenantRepository: ITenantRepository,
  ) {}

  async execute(
    id: string,
    data: Partial<TenantDomain>,
  ): Promise<TenantDomain> {
    const updated = await this.tenantRepository.update(id, data);
    if (!updated) throw new NotFoundException('Tenant introuvable');
    return updated;
  }
}
