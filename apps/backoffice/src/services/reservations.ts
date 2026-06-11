import type { Reservation } from '../types';
import { apiGet } from './api';

type ReservationApi = {
  id: string;
  logementId: string;
  dateDebut: string;
  dateFin: string;
  nbNuits: number;
  nbPersonnes: number;
  montantTotal: number;
  statut: string;
  voyageurNom: string;
  voyageurPrenom: string;
  voyageurEmail: string;
};

type LogementDetailsApi = {
  nom: string;
};

async function getLogementName(logementId: string): Promise<string> {
  try {
    const logement = await apiGet<LogementDetailsApi>(`/logements/${logementId}`);
    return logement.nom;
  } catch {
    return 'Logement inconnu';
  }
}

export async function fetchReservations(): Promise<Reservation[]> {
  const reservationsApi = await apiGet<ReservationApi[]>('/reservations');

  return Promise.all(
    reservationsApi.map(async (resa) => {
      const logementNom = await getLogementName(resa.logementId);
      return {
        id: resa.id,
        logementNom,
        voyageurNom: `${resa.voyageurPrenom} ${resa.voyageurNom}`,
        dateDebut: resa.dateDebut.substring(0, 10),
        dateFin: resa.dateFin.substring(0, 10),
        montantTotal: resa.montantTotal,
        statut: resa.statut,
      };
    }),
  );
}
