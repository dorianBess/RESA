export const PAIEMENT_REPOSITORY = Symbol('PAIEMENT_REPOSITORY');

export interface PaiementDomain {
  id: string;
  reservationId: string;
  tenantId: string;
  type: TypePaiement;
  statut: StatutPaiement;
  montant: number;
  montantRembourse?: number;
  stripePaymentIntentId: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export enum TypePaiement {
  TOTAL = 'TOTAL',
  ACOMPTE = 'ACOMPTE',
  SOLDE = 'SOLDE',
}

export enum StatutPaiement {
  EN_ATTENTE = 'EN_ATTENTE',
  CAPTURE = 'CAPTURE',
  REMBOURSE = 'REMBOURSE',
  ECHOUE = 'ECHOUE',
}

export interface IPaiementRepository {
  findById(id: string): Promise<PaiementDomain | null>;
  findByPaymentIntentId(
    paymentIntentId: string,
  ): Promise<PaiementDomain | null>;
  save(
    data: Omit<PaiementDomain, 'id' | 'createdAt' | 'updatedAt'>,
  ): Promise<PaiementDomain>;
  updateStatut(
    id: string,
    statut: StatutPaiement,
    montantRembourse?: number,
  ): Promise<PaiementDomain | null>;
}
