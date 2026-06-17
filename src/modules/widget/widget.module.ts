import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TenantEntity } from '@modules/tenant/infrastructure/entities/tenant.entity';
import { LogementEntity } from '@modules/logement/infrastructure/entities/logement.entity';
import { TarifBaseEntity } from '@modules/logement/infrastructure/entities/tarif-base.entity';
import { BlocageDatesEntity } from '@modules/logement/infrastructure/entities/blocage-dates.entity';
import { ReservationModule } from '@modules/reservation/reservation.module';
import { WidgetController } from './infrastructure/controllers/widget.controller';
import { PublicWidgetController } from './infrastructure/controllers/public-widget.controller';
import { WidgetRepository } from './infrastructure/repositories/widget.repository';
import { WIDGET_REPOSITORY } from './domain/ports/widget.repository.port';
import { ObtenirConfigWidgetUseCase } from './application/use-cases/obtenir-config-widget.use-case';
import { ModifierConfigWidgetUseCase } from './application/use-cases/modifier-config-widget.use-case';
import { RegenerarTokenWidgetUseCase } from './application/use-cases/regenerer-token-widget.use-case';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      TenantEntity,
      LogementEntity,
      TarifBaseEntity,
      BlocageDatesEntity,
    ]),
    ReservationModule,
  ],
  controllers: [WidgetController, PublicWidgetController],
  providers: [
    ObtenirConfigWidgetUseCase,
    ModifierConfigWidgetUseCase,
    RegenerarTokenWidgetUseCase,
    { provide: WIDGET_REPOSITORY, useClass: WidgetRepository },
  ],
})
export class WidgetModule {}
