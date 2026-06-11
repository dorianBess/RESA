import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ReservationEntity } from './infrastructure/entities/reservation.entity';
import { ReservationHoldEntity } from './infrastructure/entities/reservation-hold.entity';
import { ReservationController } from './infrastructure/controllers/reservation.controller';
import { ReservationRepository } from './infrastructure/repositories/reservation.repository';
import { StripeService } from './infrastructure/services/stripe.service';
import { RESERVATION_REPOSITORY } from './domain/ports/reservation.repository.port';
import { STRIPE_SERVICE } from './domain/ports/stripe.service.port';
import { CreerReservationUseCase } from './application/use-cases/creer-reservation.use-case';
import { AnnulerReservationUseCase } from './application/use-cases/annuler-reservation.use-case';
import { VerifierDisponibiliteUseCase } from './application/use-cases/verifier-disponibilite.use-case';
import { CalculerPrixUseCase } from './application/use-cases/calculer-prix.use-case';

@Module({
  imports: [
    TypeOrmModule.forFeature([ReservationEntity, ReservationHoldEntity]),
  ],
  controllers: [ReservationController],
  providers: [
    CreerReservationUseCase,
    AnnulerReservationUseCase,
    VerifierDisponibiliteUseCase,
    CalculerPrixUseCase,
    { provide: RESERVATION_REPOSITORY, useClass: ReservationRepository },
    { provide: STRIPE_SERVICE, useClass: StripeService },
  ],
  exports: [
    CreerReservationUseCase,
    AnnulerReservationUseCase,
    VerifierDisponibiliteUseCase,
    CalculerPrixUseCase,
    RESERVATION_REPOSITORY,
  ],
})
export class ReservationModule {}
