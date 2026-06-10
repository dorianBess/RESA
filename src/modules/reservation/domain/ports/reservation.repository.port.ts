/**
 * PORT SORTANT — Interface du repository Réservation.
 *
 * Ce fichier définit le contrat que toute implémentation
 * de stockage doit respecter. Le domaine métier ne connaît
 * QUE cette interface — jamais l'implémentation concrète.
 *
 * Si on change PostgreSQL pour MongoDB demain, seul le fichier
 * reservation.repository.ts change. Aucun use-case n'est touché.
 */

export const RESERVATION_REPOSITORY = Symbol('RESERVATION_REPOSITORY');

export interface IReservationRepository {
  findById(id: string, tenantId: string): Promise<ReservationDomain | null>;
  findByLogement(logementId: string, tenantId: string): Promise<ReservationDomain[]>;
  existsConflict(logementId: string, debut: Date, fin: Date, excludeId?: string): Promise<boolean>;
  save(reservation: ReservationDomain): Promise<ReservationDomain>;
  updateStatut(id: string, tenantId: string, statut: string): Promise<void>;
  createHold(hold: ReservationHoldDomain): Promise<ReservationHoldDomain>;
  deleteExpiredHolds(): Promise<void>;
  existsActiveHold(logementId: string, debut: Date, fin: Date): Promise<boolean>;
}

// Types domaine (indépendants de TypeORM)
export interface ReservationDomain {
  id?: string;
  tenantId: string;
  logementId: string;
  dateDebut: Date;
  dateFin: Date;
  nbNuits: number;
  nbPersonnes: number;
  montantTotal: number;
  montantAcompte?: number;
  statut: StatutReservation;
  voyageurNom: string;
  voyageurPrenom: string;
  voyageurEmail: string;
  voyageurTelephone?: string;
  notes?: string;
  createdAt?: Date;
}

export interface ReservationHoldDomain {
  id?: string;
  tenantId: string;
  logementId: string;
  dateDebut: Date;
  dateFin: Date;
  expiresAt: Date;
  statut: 'ACTIF' | 'EXPIRE' | 'CONVERTI';
}

export enum StatutReservation {
  EN_ATTENTE = 'EN_ATTENTE',
  CONFIRMEE = 'CONFIRMEE',
  ANNULEE = 'ANNULEE',
  REMBOURSEE = 'REMBOURSEE',
  CONFLIT = 'CONFLIT',
}
