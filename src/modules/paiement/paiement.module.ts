import { Module } from '@nestjs/common';
// Structure hexagonale identique à ReservationModule
// Ports sortants : PORT_PAIEMENT (Stripe), PORT_DB
// Use-cases : CreerPaymentIntentUseCase, ConfirmerPaiementUseCase, RembourserUseCase
@Module({})
export class PaiementModule {}
