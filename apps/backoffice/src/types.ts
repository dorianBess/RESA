export type UserSession = {
  email: string;
  tenantName: string;
};

export type Logement = {
  id: string;
  nom: string;
  ville: string;
  capacite: number;
  statut: string;
  tarifParNuit: number;
};

export type Reservation = {
  id: string;
  logementNom: string;
  voyageurNom: string;
  dateDebut: string;
  dateFin: string;
  montantTotal: number;
  statut: string;
};

export type WidgetSettings = {
  tokenPublic: string;
  couleurPrimaire: string;
  couleurSecondaire: string;
  couleurTexte: string;
  borderRadius: number;
};

export type NewLogement = {
  nom: string;
  ville: string;
  capacite: number;
  statut: string;
  tarifParNuit: number;
};

export type Blocage = {
  id: string;
  logementId: string;
  dateDebut: string;
  dateFin: string;
  motif: string | null;
  source: string;
};
