import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TenantEntity } from './infrastructure/entities/tenant.entity';
import { TenantController } from './infrastructure/controllers/tenant.controller';
import { TenantRepository } from './infrastructure/repositories/tenant.repository';
import { TENANT_REPOSITORY } from './domain/ports/tenant.repository.port';
import { ListerTenantsUseCase } from './application/use-cases/lister-tenants.use-case';
import { ObtenirTenantUseCase } from './application/use-cases/obtenir-tenant.use-case';
import { CreerTenantUseCase } from './application/use-cases/creer-tenant.use-case';
import { ModifierTenantUseCase } from './application/use-cases/modifier-tenant.use-case';
import { ModifierStatutTenantUseCase } from './application/use-cases/modifier-statut-tenant.use-case';

@Module({
  imports: [TypeOrmModule.forFeature([TenantEntity])],
  controllers: [TenantController],
  providers: [
    ListerTenantsUseCase,
    ObtenirTenantUseCase,
    CreerTenantUseCase,
    ModifierTenantUseCase,
    ModifierStatutTenantUseCase,
    { provide: TENANT_REPOSITORY, useClass: TenantRepository },
  ],
  exports: [TypeOrmModule],
})
export class TenantModule {}
