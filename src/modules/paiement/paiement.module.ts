import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PaiementEntity } from './infrastructure/entities/paiement.entity';
import { ReservationEntity } from '@modules/reservation/infrastructure/entities/reservation.entity';
import { PaiementController } from './infrastructure/controllers/paiement.controller';
import { PaiementRepository } from './infrastructure/repositories/paiement.repository';
import { ReservationPaiementRepository } from './infrastructure/repositories/reservation-paiement.repository';
import { StripeService } from '@modules/reservation/infrastructure/services/stripe.service';
import { PAIEMENT_REPOSITORY } from './domain/ports/paiement.repository.port';
import { RESERVATION_PAIEMENT_REPOSITORY } from './domain/ports/reservation-paiement.repository.port';
import { STRIPE_SERVICE } from '@modules/reservation/domain/ports/stripe.service.port';
import { ConfirmerPaiementUseCase } from './application/use-cases/confirmer-paiement.use-case';
import { RembourserPaiementUseCase } from './application/use-cases/rembourser-paiement.use-case';

@Module({
  imports: [TypeOrmModule.forFeature([PaiementEntity, ReservationEntity])],
  controllers: [PaiementController],
  providers: [
    ConfirmerPaiementUseCase,
    RembourserPaiementUseCase,
    { provide: PAIEMENT_REPOSITORY, useClass: PaiementRepository },
    {
      provide: RESERVATION_PAIEMENT_REPOSITORY,
      useClass: ReservationPaiementRepository,
    },
    { provide: STRIPE_SERVICE, useClass: StripeService },
  ],
})
export class PaiementModule {}
