import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LogementModule } from '@modules/logement/logement.module';
import { ReservationModule } from '@modules/reservation/reservation.module';
import { PaiementModule } from '@modules/paiement/paiement.module';
import { WidgetModule } from '@modules/widget/widget.module';
import { SynchronisationModule } from '@modules/synchronisation/synchronisation.module';
import { NotificationModule } from '@modules/notification/notification.module';

@Module({
  imports: [
    // Configuration globale (.env)
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),

    // Base de données PostgreSQL
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        url: config.get<string>('DATABASE_URL'),
        ssl: config.get<string>('DATABASE_SSL') === 'true'
          ? { rejectUnauthorized: false }
          : false,
        autoLoadEntities: true,
        // En production : migrations manuelles uniquement
        synchronize: config.get<string>('NODE_ENV') === 'development',
        logging: config.get<string>('NODE_ENV') === 'development',
      }),
      inject: [ConfigService],
    }),

    // Modules métier (architecture hexagonale)
    LogementModule,
    ReservationModule,
    PaiementModule,
    WidgetModule,
    SynchronisationModule,
    NotificationModule,
  ],
})
export class AppModule {}
