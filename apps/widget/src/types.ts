export type LogementItem = {
  id: string;
  nom: string;
  description: string;
  capacite: number;
  tarifParNuit: number;
  devise: string;
  ville?: string;
};

export type WidgetConfig = {
  token: string;
  logementId: string;
  logementNom: string;
  description: string;
  capacite: number;
  ville?: string;
  tarifParNuit: number;
  devise: string;
  couleurPrimaire: string;
  couleurSecondaire: string;
  couleurTexte: string;
  borderRadius: number;
};

export type AvailabilityRequest = {
  logementId: string;
  dateDebut: string;
  dateFin: string;
  nbPersonnes: number;
};

export type AvailabilityResponse = {
  disponible: boolean;
  motif?: string;
};

export type BlockedRange = {
  start: string;
  end: string;
};

export type ReservationPayload = {
  logementId: string;
  dateDebut: string;
  dateFin: string;
  nbPersonnes: number;
  voyageurNom: string;
  voyageurPrenom: string;
  voyageurEmail: string;
  voyageurTelephone: string;
  notes: string;
  montantTotal: number;
};

export type ReservationResponse = {
  reference: string;
  statut: string;
};
