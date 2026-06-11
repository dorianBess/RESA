export const AUTH_REPOSITORY = Symbol('AUTH_REPOSITORY');

export interface ITenantCredentials {
  id: string;
  email: string;
  motDePasseHash: string;
  raisonSociale: string;
  abonnementStatut: string;
}

export interface IAuthRepository {
  findByEmail(email: string): Promise<ITenantCredentials | null>;
  emailExists(email: string): Promise<boolean>;
  createTenant(data: {
    raisonSociale: string;
    email: string;
    motDePasseHash: string;
  }): Promise<ITenantCredentials>;
}
