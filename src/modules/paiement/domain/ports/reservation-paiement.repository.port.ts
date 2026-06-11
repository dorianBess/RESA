export const RESERVATION_PAIEMENT_REPOSITORY = Symbol('RESERVATION_PAIEMENT_REPOSITORY');

export interface ReservationForPaiement {
  id: string;
  tenantId: string;
  statut: string;
  montantTotal: number;
  montantAcompte?: number;
  stripePaymentIntentId?: string;
}

export interface IReservationPaiementRepository {
  findByPaymentIntentId(paymentIntentId: string): Promise<ReservationForPaiement | null>;
  updateStatut(id: string, statut: string): Promise<void>;
}
