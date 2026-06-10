import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

// Entité
import { ReservationEntity } from './infrastructure/entities/reservation.entity';
import { ReservationHoldEntity } from './infrastructure/entities/reservation-hold.entity';

// Port entrant (controller)
import { ReservationController } from './infrastructure/controllers/reservation.controller';

// Port sortant (repository)
import { ReservationRepository } from './infrastructure/repositories/reservation.repository';
import { RESERVATION_REPOSITORY } from './domain/ports/reservation.repository.port';

// Cas d'usage (domaine métier)
import { CreerReservationUseCase } from './application/use-cases/creer-reservation.use-case';
import { VerifierDisponibiliteUseCase } from './application/use-cases/verifier-disponibilite.use-case';
import { CalculerPrixUseCase } from './application/use-cases/calculer-prix.use-case';

@Module({
  imports: [
    TypeOrmModule.forFeature([ReservationEntity, ReservationHoldEntity]),
  ],
  controllers: [
    // Port entrant REST
    ReservationController,
  ],
  providers: [
    // Cas d'usage — logique métier pure
    CreerReservationUseCase,
    VerifierDisponibiliteUseCase,
    CalculerPrixUseCase,

    // Binding port sortant → implémentation infrastructure
    {
      provide: RESERVATION_REPOSITORY,
      useClass: ReservationRepository,
    },
  ],
  exports: [
    CreerReservationUseCase,
    VerifierDisponibiliteUseCase,
    CalculerPrixUseCase,
  ],
})
export class ReservationModule {}
