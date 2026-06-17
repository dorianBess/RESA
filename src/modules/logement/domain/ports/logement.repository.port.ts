export const LOGEMENT_REPOSITORY = Symbol('LOGEMENT_REPOSITORY');

export interface LogementDomain {
  id: string;
  tenantId: string;
  nom: string;
  description?: string;
  capacite: number;
  statut: StatutLogement;
  urlIcalAirbnb?: string;
  urlIcalBooking?: string;
  photos?: PhotoDomain[];
  tarifBase?: TarifBaseDomain;
  configAcompte?: ConfigAcompteDomain;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface PhotoDomain {
  id: string;
  logementId: string;
  tenantId: string;
  url: string;
  ordre: number;
}

export interface TarifBaseDomain {
  id: string;
  logementId: string;
  prixParNuit: number;
  prixSemaine?: number;
}

export interface TarifSaisonnierDomain {
  id: string;
  logementId: string;
  nom: string;
  dateDebut: Date;
  dateFin: Date;
  prixParNuit: number;
  priorite: number;
}

export interface ConfigAcompteDomain {
  id: string;
  logementId: string;
  actif: boolean;
  pourcentage: number;
  delaiSoldeJours: number;
}

export enum StatutLogement {
  ACTIF = 'ACTIF',
  ARCHIVE = 'ARCHIVE',
}

export interface ILogementRepository {
  findAll(
    tenantId: string,
    opts?: { statut?: string; page?: number; limit?: number },
  ): Promise<{ data: LogementDomain[]; total: number }>;
  findById(id: string, tenantId: string): Promise<LogementDomain | null>;
  create(
    data: Omit<LogementDomain, 'id' | 'createdAt' | 'updatedAt'>,
  ): Promise<LogementDomain>;
  update(
    id: string,
    tenantId: string,
    data: Partial<LogementDomain>,
  ): Promise<LogementDomain | null>;
  hasReservationsFutures(id: string): Promise<boolean>;
  findAllWithoutTenantFilter(id: string): Promise<LogementDomain | null>;
}
