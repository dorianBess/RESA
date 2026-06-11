import type { WidgetSettings } from '../types';
import { apiGet, apiPut, apiPost } from './api';

type WidgetConfigApi = {
  tenantId: string;
  tokenPublic: string;
  config: {
    couleurPrimaire: string;
    couleurSecondaire: string;
    couleurTexte: string;
    police: string;
    borderRadius: number;
    logoUrl?: string;
  };
  codeHtml: string;
};

export async function fetchWidgetSettings(): Promise<WidgetSettings> {
  const response = await apiGet<WidgetConfigApi>('/config/widget');
  return {
    tokenPublic: response.tokenPublic,
    couleurPrimaire: response.config.couleurPrimaire,
    couleurSecondaire: response.config.couleurSecondaire,
    couleurTexte: response.config.couleurTexte,
    borderRadius: response.config.borderRadius,
  };
}

export async function updateWidgetSettings(settings: Partial<Omit<WidgetSettings, 'tokenPublic'>>): Promise<WidgetSettings> {
  const response = await apiPut<WidgetConfigApi>('/config/widget', settings);
  return {
    tokenPublic: response.tokenPublic,
    couleurPrimaire: response.config.couleurPrimaire,
    couleurSecondaire: response.config.couleurSecondaire,
    couleurTexte: response.config.couleurTexte,
    borderRadius: response.config.borderRadius,
  };
}

export async function regenererToken(): Promise<string> {
  const response = await apiPost<WidgetConfigApi>('/config/widget/regenerer-token', {});
  return response.tokenPublic;
}

export function buildWidgetEmbedCode(tokenPublic: string): string {
  return [
    '<script src="https://widget.resa.local/embed.js" defer></script>',
    `<div data-resa-widget="${tokenPublic}"></div>`,
  ].join('\n');
}
