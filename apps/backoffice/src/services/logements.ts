import type { Logement, NewLogement } from '../types';

const logements: Logement[] = [
  {
    id: 'log-1',
    nom: 'La Maison des Pins',
    ville: 'Biarritz',
    capacite: 4,
    statut: 'ACTIF',
    tarifParNuit: 120,
  },
  {
    id: 'log-2',
    nom: 'L Atelier du Port',
    ville: 'La Rochelle',
    capacite: 2,
    statut: 'ACTIF',
    tarifParNuit: 95,
  },
];

export async function fetchLogements(): Promise<Logement[]> {
  return [...logements];
}

export async function createLogement(payload: NewLogement): Promise<Logement> {
  const logement: Logement = {
    id: `log-${Date.now()}`,
    ...payload,
  };

  logements.unshift(logement);
  return logement;
}
