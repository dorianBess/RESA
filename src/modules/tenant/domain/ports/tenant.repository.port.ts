export const TENANT_REPOSITORY = Symbol('TENANT_REPOSITORY');

export interface TenantDomain {
  id: string;
  raisonSociale: string;
  email: string;
  abonnementStatut: string;
  abonnementDebut: Date | null;
  abonnementFin: Date | null;
  createdAt?: Date;
  updatedAt?: Date;
}

export type StatutAbonnementValue = 'ESSAI' | 'ACTIF' | 'SUSPENDU' | 'RESILIE';

export interface ITenantRepository {
  findAll(): Promise<TenantDomain[]>;
  findById(id: string): Promise<TenantDomain | null>;
  emailExists(email: string): Promise<boolean>;
  create(data: {
    raisonSociale: string;
    email: string;
    motDePasseHash: string;
  }): Promise<TenantDomain>;
  update(id: string, data: Partial<TenantDomain>): Promise<TenantDomain | null>;
  updateStatut(id: string, statut: StatutAbonnementValue): Promise<TenantDomain | null>;
}
