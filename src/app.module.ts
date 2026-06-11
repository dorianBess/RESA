import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '@modules/auth/auth.module';
import { TenantModule } from '@modules/tenant/tenant.module';
import { LogementModule } from '@modules/logement/logement.module';
import { ReservationModule } from '@modules/reservation/reservation.module';
import { PaiementModule } from '@modules/paiement/paiement.module';
import { WidgetModule } from '@modules/widget/widget.module';
import { SynchronisationModule } from '@modules/synchronisation/synchronisation.module';
import { NotificationModule } from '@modules/notification/notification.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),

    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        url: config.get<string>('DATABASE_URL'),
        ssl: config.get<string>('DATABASE_SSL') === 'true'
          ? { rejectUnauthorized: false }
          : false,
        autoLoadEntities: true,
        synchronize: config.get<string>('NODE_ENV') === 'development',
        logging: config.get<string>('NODE_ENV') === 'development',
      }),
      inject: [ConfigService],
    }),

    AuthModule,
    TenantModule,
    LogementModule,
    ReservationModule,
    PaiementModule,
    WidgetModule,
    SynchronisationModule,
    NotificationModule,
  ],
})
export class AppModule {}
