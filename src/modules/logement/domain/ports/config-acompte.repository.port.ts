import { ConfigAcompteDomain } from './logement.repository.port';

export const CONFIG_ACOMPTE_REPOSITORY = Symbol('CONFIG_ACOMPTE_REPOSITORY');

export interface IConfigAcompteRepository {
  findByLogement(logementId: string): Promise<ConfigAcompteDomain | null>;
  upsert(
    logementId: string,
    tenantId: string,
    data: {
      actif: boolean;
      pourcentage?: number;
      delaiSoldeJours?: number;
    },
  ): Promise<ConfigAcompteDomain>;
}
