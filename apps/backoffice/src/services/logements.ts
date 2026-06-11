import type { Logement, NewLogement } from '../types';
import { apiGet, apiPost, apiPut } from './api';

type LogementApi = {
  id: string;
  nom: string;
  description?: string;
  capacite: number;
  statut: string;
};

type LogementListResponse = {
  data: LogementApi[];
  total: number;
};

type TarifResponse = {
  tarifBase: { prixParNuit: number } | null;
  tarifsSaisonniers: unknown[];
};

export async function fetchLogements(): Promise<Logement[]> {
  const response = await apiGet<LogementListResponse>('/logements');

  return Promise.all(
    response.data.map(async (item) => {
      const tarifs = await apiGet<TarifResponse>(`/logements/${item.id}/tarifs`);
      return {
        id: item.id,
        nom: item.nom,
        ville: item.description ?? '',
        capacite: item.capacite,
        statut: item.statut,
        tarifParNuit: tarifs.tarifBase?.prixParNuit ?? 0,
      };
    }),
  );
}

export async function createLogement(payload: NewLogement): Promise<Logement> {
  const result = await apiPost<LogementApi>('/logements', {
    nom: payload.nom,
    capacite: payload.capacite,
    description: payload.ville,
  });

  await apiPut(`/logements/${result.id}/tarifs/base`, {
    prixParNuit: payload.tarifParNuit,
  });

  return {
    id: result.id,
    nom: result.nom,
    ville: payload.ville,
    capacite: result.capacite,
    statut: result.statut,
    tarifParNuit: payload.tarifParNuit,
  };
}
