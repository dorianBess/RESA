import { Module } from '@nestjs/common';
// Worker asynchrone — polling iCal Airbnb/Booking toutes les 15 min
// Ports sortants : PORT_ICAL (HTTP), PORT_DB
// Use-cases : SynchroniserICalUseCase, DetecterConflitsUseCase
@Module({})
export class SynchronisationModule {}
