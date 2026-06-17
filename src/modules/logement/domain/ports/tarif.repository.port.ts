import {
  TarifBaseDomain,
  TarifSaisonnierDomain,
} from './logement.repository.port';

export const TARIF_REPOSITORY = Symbol('TARIF_REPOSITORY');

export interface ITarifRepository {
  findBase(logementId: string): Promise<TarifBaseDomain | null>;
  upsertBase(
    logementId: string,
    tenantId: string,
    data: { prixParNuit: number; prixSemaine?: number },
  ): Promise<TarifBaseDomain>;
  findSaisonniers(logementId: string): Promise<TarifSaisonnierDomain[]>;
  createSaisonnier(
    logementId: string,
    tenantId: string,
    data: Omit<TarifSaisonnierDomain, 'id' | 'logementId'>,
  ): Promise<TarifSaisonnierDomain>;
  updateSaisonnier(
    id: string,
    tenantId: string,
    data: Partial<TarifSaisonnierDomain>,
  ): Promise<TarifSaisonnierDomain | null>;
  deleteSaisonnier(id: string, tenantId: string): Promise<boolean>;
  findApplicable(
    logementId: string,
    dateDebut: Date,
    dateFin: Date,
  ): Promise<TarifSaisonnierDomain | null>;
}
