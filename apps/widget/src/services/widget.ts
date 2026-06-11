import { apiGet, hasApiBaseUrl } from './api';
import type { LogementItem, WidgetConfig } from '../types';

const mockWidgetConfig: WidgetConfig = {
  token: 'demo-widget',
  logementId: 'logement-demo',
  logementNom: 'La Maison des Pins',
  description:
    'Logement touristique pour 4 personnes avec séjour lumineux, cuisine équipée et terrasse.',
  capacite: 4,
  ville: 'Biarritz',
  tarifParNuit: 120,
  devise: 'EUR',
  couleurPrimaire: '#1b4965',
  couleurSecondaire: '#f1efe7',
  couleurTexte: '#102a43',
  borderRadius: 18,
};

export async function fetchLogements(token: string): Promise<LogementItem[]> {
  return apiGet<LogementItem[]>(`/widget/${token}/logements`);
}

export async function fetchWidgetConfig(token: string): Promise<WidgetConfig> {
  if (!hasApiBaseUrl()) {
    return Promise.resolve({
      ...mockWidgetConfig,
      token,
    });
  }

  try {
    return await apiGet<WidgetConfig>(`/widget/${token}`);
  } catch {
    return {
      ...mockWidgetConfig,
      token,
    };
  }
}
