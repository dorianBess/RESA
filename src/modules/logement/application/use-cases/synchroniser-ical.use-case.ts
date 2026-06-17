import { Injectable, Inject } from '@nestjs/common';
import {
  ICAL_REPOSITORY,
  IIcalRepository,
  ICAL_FETCHER,
  IIcalFetcher,
  NOTIFICATION_SERVICE,
  INotificationService,
} from '../../domain/ports/ical.repository.port';
import {
  BLOCAGE_REPOSITORY,
  IBlocageRepository,
  SourceBlocage,
} from '../../domain/ports/blocage.repository.port';
import {
  DISPONIBILITE_REPOSITORY,
  IDisponibiliteRepository,
} from '../../domain/ports/disponibilite.repository.port';

export interface SynchronisationResult {
  blocagesCrees: number;
  conflitsDetectes: number;
}

@Injectable()
export class SynchroniserIcalUseCase {
  constructor(
    @Inject(ICAL_REPOSITORY) private readonly icalRepository: IIcalRepository,
    @Inject(ICAL_FETCHER) private readonly icalFetcher: IIcalFetcher,
    @Inject(BLOCAGE_REPOSITORY)
    private readonly blocageRepository: IBlocageRepository,
    @Inject(DISPONIBILITE_REPOSITORY)
    private readonly disponibiliteRepository: IDisponibiliteRepository,
    @Inject(NOTIFICATION_SERVICE)
    private readonly notificationService: INotificationService,
  ) {}

  async execute(
    logementId: string,
    tenantId: string,
    tenantEmail: string,
    logementNom: string,
  ): Promise<SynchronisationResult> {
    const urls = await this.icalRepository.getUrls(logementId);
    if (!urls) return { blocagesCrees: 0, conflitsDetectes: 0 };

    let blocagesCrees = 0;
    let conflitsDetectes = 0;

    const sources: { url: string; source: SourceBlocage }[] = [];
    if (urls.urlIcalAirbnb)
      sources.push({ url: urls.urlIcalAirbnb, source: SourceBlocage.AIRBNB });
    if (urls.urlIcalBooking)
      sources.push({ url: urls.urlIcalBooking, source: SourceBlocage.BOOKING });

    for (const { url, source } of sources) {
      const events = await this.icalFetcher.fetch(url);
      for (const event of events) {
        // Idempotence : ne pas créer de doublon
        const existing = await this.blocageRepository.findByDateRange(
          logementId,
          event.dateDebut,
          event.dateFin,
          source,
        );
        if (existing.length > 0) continue;

        // Détection conflit avec réservation confirmée
        const conflitResa = await this.disponibiliteRepository.existsConflict(
          logementId,
          event.dateDebut,
          event.dateFin,
        );

        await this.blocageRepository.create({
          logementId,
          tenantId,
          dateDebut: event.dateDebut,
          dateFin: event.dateFin,
          source,
          statut: conflitResa ? 'CONFLIT' : 'NORMAL',
        });
        blocagesCrees++;

        if (conflitResa) {
          conflitsDetectes++;
          await this.notificationService.sendConflitIcalAlert(
            tenantEmail,
            logementNom,
            event.dateDebut,
            event.dateFin,
          );
        }
      }
    }

    return { blocagesCrees, conflitsDetectes };
  }
}
