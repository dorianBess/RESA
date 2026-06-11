import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TenantEntity } from '@modules/tenant/infrastructure/entities/tenant.entity';
import { WidgetController } from './infrastructure/controllers/widget.controller';
import { WidgetRepository } from './infrastructure/repositories/widget.repository';
import { WIDGET_REPOSITORY } from './domain/ports/widget.repository.port';
import { ObtenirConfigWidgetUseCase } from './application/use-cases/obtenir-config-widget.use-case';
import { ModifierConfigWidgetUseCase } from './application/use-cases/modifier-config-widget.use-case';
import { RegenerarTokenWidgetUseCase } from './application/use-cases/regenerer-token-widget.use-case';

@Module({
  imports: [TypeOrmModule.forFeature([TenantEntity])],
  controllers: [WidgetController],
  providers: [
    ObtenirConfigWidgetUseCase,
    ModifierConfigWidgetUseCase,
    RegenerarTokenWidgetUseCase,
    { provide: WIDGET_REPOSITORY, useClass: WidgetRepository },
  ],
})
export class WidgetModule {}
