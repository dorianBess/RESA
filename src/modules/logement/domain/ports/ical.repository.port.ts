export const ICAL_REPOSITORY = Symbol('ICAL_REPOSITORY');
export const ICAL_FETCHER = Symbol('ICAL_FETCHER');
export const NOTIFICATION_SERVICE = Symbol('NOTIFICATION_SERVICE');

export interface IcalEvent {
  uid: string;
  dateDebut: Date;
  dateFin: Date;
  summary?: string;
}

export interface IIcalFetcher {
  fetch(url: string): Promise<IcalEvent[]>;
}

export interface IIcalRepository {
  saveUrls(logementId: string, tenantId: string, data: { urlIcalAirbnb?: string; urlIcalBooking?: string }): Promise<void>;
  getUrls(logementId: string): Promise<{ urlIcalAirbnb?: string; urlIcalBooking?: string } | null>;
}

export interface INotificationService {
  sendConflitIcalAlert(tenantEmail: string, logementNom: string, dateDebut: Date, dateFin: Date): Promise<void>;
}
