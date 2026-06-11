import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { LogementEntity } from './infrastructure/entities/logement.entity';
import { PhotoEntity } from './infrastructure/entities/photo.entity';
import { TarifBaseEntity } from './infrastructure/entities/tarif-base.entity';
import { TarifSaisonnierEntity } from './infrastructure/entities/tarif-saisonnier.entity';
import { BlocageDatesEntity } from './infrastructure/entities/blocage-dates.entity';
import { ConfigAcompteEntity } from './infrastructure/entities/config-acompte.entity';

import { LogementController } from './infrastructure/controllers/logement.controller';

import { LogementRepository } from './infrastructure/repositories/logement.repository';
import { PhotoRepository } from './infrastructure/repositories/photo.repository';
import { TarifRepository } from './infrastructure/repositories/tarif.repository';
import { BlocageRepository } from './infrastructure/repositories/blocage.repository';
import { ConfigAcompteRepository } from './infrastructure/repositories/config-acompte.repository';
import { DisponibiliteRepository } from './infrastructure/repositories/disponibilite.repository';
import { IcalRepository } from './infrastructure/repositories/ical.repository';
import { StorageService } from './infrastructure/services/storage.service';
import { IcalFetcherService } from './infrastructure/services/ical-fetcher.service';
import { NotificationService } from './infrastructure/services/notification.service';

import { LOGEMENT_REPOSITORY } from './domain/ports/logement.repository.port';
import { PHOTO_REPOSITORY, STORAGE_SERVICE } from './domain/ports/photo.repository.port';
import { TARIF_REPOSITORY } from './domain/ports/tarif.repository.port';
import { BLOCAGE_REPOSITORY } from './domain/ports/blocage.repository.port';
import { CONFIG_ACOMPTE_REPOSITORY } from './domain/ports/config-acompte.repository.port';
import { DISPONIBILITE_REPOSITORY } from './domain/ports/disponibilite.repository.port';
import { ICAL_REPOSITORY, ICAL_FETCHER, NOTIFICATION_SERVICE } from './domain/ports/ical.repository.port';

import { ListerLogementsUseCase } from './application/use-cases/lister-logements.use-case';
import { ObtenirLogementUseCase } from './application/use-cases/obtenir-logement.use-case';
import { CreerLogementUseCase } from './application/use-cases/creer-logement.use-case';
import { ModifierLogementUseCase } from './application/use-cases/modifier-logement.use-case';
import { ArchiverLogementUseCase } from './application/use-cases/archiver-logement.use-case';
import { VerifierDisponibiliteCompletUseCase } from './application/use-cases/verifier-disponibilite-complet.use-case';
import { UploaderPhotoUseCase } from './application/use-cases/uploader-photo.use-case';
import { SupprimerPhotoUseCase } from './application/use-cases/supprimer-photo.use-case';
import { ReordonnerPhotosUseCase } from './application/use-cases/reordonner-photos.use-case';
import { UpsertTarifBaseUseCase } from './application/use-cases/upsert-tarif-base.use-case';
import { CreerTarifSaisonnierUseCase } from './application/use-cases/creer-tarif-saisonnier.use-case';
import { ModifierTarifSaisonnierUseCase } from './application/use-cases/modifier-tarif-saisonnier.use-case';
import { SupprimerTarifSaisonnierUseCase } from './application/use-cases/supprimer-tarif-saisonnier.use-case';
import { CreerBlocageUseCase } from './application/use-cases/creer-blocage.use-case';
import { SupprimerBlocageUseCase } from './application/use-cases/supprimer-blocage.use-case';
import { UpsertConfigAcompteUseCase } from './application/use-cases/upsert-config-acompte.use-case';
import { ConfigurerIcalUseCase } from './application/use-cases/configurer-ical.use-case';
import { SynchroniserIcalUseCase } from './application/use-cases/synchroniser-ical.use-case';

import { ReservationModule } from '@modules/reservation/reservation.module';
import { ReservationEntity } from '@modules/reservation/infrastructure/entities/reservation.entity';
import { ReservationHoldEntity } from '@modules/reservation/infrastructure/entities/reservation-hold.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      LogementEntity, PhotoEntity, TarifBaseEntity, TarifSaisonnierEntity,
      BlocageDatesEntity, ConfigAcompteEntity, ReservationEntity, ReservationHoldEntity,
    ]),
    ReservationModule,
  ],
  controllers: [LogementController],
  providers: [
    ListerLogementsUseCase, ObtenirLogementUseCase, CreerLogementUseCase,
    ModifierLogementUseCase, ArchiverLogementUseCase, VerifierDisponibiliteCompletUseCase,
    UploaderPhotoUseCase, SupprimerPhotoUseCase, ReordonnerPhotosUseCase,
    UpsertTarifBaseUseCase, CreerTarifSaisonnierUseCase, ModifierTarifSaisonnierUseCase,
    SupprimerTarifSaisonnierUseCase, CreerBlocageUseCase, SupprimerBlocageUseCase,
    UpsertConfigAcompteUseCase, ConfigurerIcalUseCase, SynchroniserIcalUseCase,
    { provide: LOGEMENT_REPOSITORY, useClass: LogementRepository },
    { provide: PHOTO_REPOSITORY, useClass: PhotoRepository },
    { provide: STORAGE_SERVICE, useClass: StorageService },
    { provide: TARIF_REPOSITORY, useClass: TarifRepository },
    { provide: BLOCAGE_REPOSITORY, useClass: BlocageRepository },
    { provide: CONFIG_ACOMPTE_REPOSITORY, useClass: ConfigAcompteRepository },
    { provide: DISPONIBILITE_REPOSITORY, useClass: DisponibiliteRepository },
    { provide: ICAL_REPOSITORY, useClass: IcalRepository },
    { provide: ICAL_FETCHER, useClass: IcalFetcherService },
    { provide: NOTIFICATION_SERVICE, useClass: NotificationService },
  ],
  exports: [TARIF_REPOSITORY, BLOCAGE_REPOSITORY, CONFIG_ACOMPTE_REPOSITORY],
})
export class LogementModule {}
