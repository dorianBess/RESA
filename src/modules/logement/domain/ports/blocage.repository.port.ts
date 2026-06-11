export const BLOCAGE_REPOSITORY = Symbol('BLOCAGE_REPOSITORY');

export interface BlocageDomain {
  id: string;
  logementId: string;
  tenantId: string;
  dateDebut: Date;
  dateFin: Date;
  source: SourceBlocage;
  motif?: string;
  statut?: string;
  createdAt?: Date;
}

export enum SourceBlocage {
  MANUEL = 'MANUEL',
  AIRBNB = 'AIRBNB',
  BOOKING = 'BOOKING',
  RESERVATION_RESA = 'RESERVATION_RESA',
}

export interface IBlocageRepository {
  findByLogement(
    logementId: string,
    tenantId: string,
    opts?: { dateDebut?: Date; dateFin?: Date; source?: string },
  ): Promise<BlocageDomain[]>;
  findById(id: string): Promise<BlocageDomain | null>;
  existsConflictWithReservation(logementId: string, dateDebut: Date, dateFin: Date): Promise<boolean>;
  existsConflict(logementId: string, dateDebut: Date, dateFin: Date): Promise<boolean>;
  create(data: Omit<BlocageDomain, 'id' | 'createdAt'>): Promise<BlocageDomain>;
  delete(id: string): Promise<void>;
  findByDateRange(logementId: string, dateDebut: Date, dateFin: Date, source?: SourceBlocage): Promise<BlocageDomain[]>;
}
