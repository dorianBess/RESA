import { Injectable, Inject } from '@nestjs/common';
import { TENANT_REPOSITORY, ITenantRepository, TenantDomain } from '../../domain/ports/tenant.repository.port';

@Injectable()
export class ListerTenantsUseCase {
  constructor(@Inject(TENANT_REPOSITORY) private readonly tenantRepository: ITenantRepository) {}

  execute(): Promise<TenantDomain[]> {
    return this.tenantRepository.findAll();
  }
}
