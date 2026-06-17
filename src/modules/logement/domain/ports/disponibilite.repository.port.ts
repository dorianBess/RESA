export const DISPONIBILITE_REPOSITORY = Symbol('DISPONIBILITE_REPOSITORY');

export interface IDisponibiliteRepository {
  existsConflict(
    logementId: string,
    dateDebut: Date,
    dateFin: Date,
  ): Promise<boolean>;
  existsActiveHold(
    logementId: string,
    dateDebut: Date,
    dateFin: Date,
  ): Promise<boolean>;
}
