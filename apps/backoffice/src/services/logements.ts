import type { BlockedPeriod, Logement, NewBlockedPeriod, NewLogement } from '../types';

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

const blockedPeriods: BlockedPeriod[] = [
  {
    id: 'block-1',
    logementId: 'log-1',
    logementNom: 'La Maison des Pins',
    dateDebut: '2026-06-18',
    dateFin: '2026-06-21',
    motif: 'Maintenance',
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

export async function fetchBlockedPeriods(): Promise<BlockedPeriod[]> {
  return [...blockedPeriods];
}

export async function createBlockedPeriod(payload: NewBlockedPeriod): Promise<BlockedPeriod> {
  const logement = logements.find((item) => item.id === payload.logementId);

  if (!logement) {
    throw new Error('Logement introuvable.');
  }

  const blockedPeriod: BlockedPeriod = {
    id: `block-${Date.now()}`,
    logementId: payload.logementId,
    logementNom: logement.nom,
    dateDebut: payload.dateDebut,
    dateFin: payload.dateFin,
    motif: payload.motif,
  };

  blockedPeriods.unshift(blockedPeriod);
  return blockedPeriod;
}
