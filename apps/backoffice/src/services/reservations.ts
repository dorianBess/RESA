import type { Reservation } from '../types';

const reservations: Reservation[] = [
  {
    id: 'resa-1',
    logementNom: 'La Maison des Pins',
    voyageurNom: 'Camille Martin',
    dateDebut: '2026-06-14',
    dateFin: '2026-06-18',
    montantTotal: 480,
    statut: 'CONFIRMEE',
  },
  {
    id: 'resa-2',
    logementNom: 'L Atelier du Port',
    voyageurNom: 'Lucas Bernard',
    dateDebut: '2026-06-20',
    dateFin: '2026-06-23',
    montantTotal: 285,
    statut: 'EN_ATTENTE',
  },
];

export async function fetchReservations(): Promise<Reservation[]> {
  return [...reservations];
}
