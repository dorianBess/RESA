import type { WidgetSettings } from '../types';

const widgetSettings: WidgetSettings = {
  tokenPublic: 'demo-widget',
  couleurPrimaire: '#1b4965',
  couleurSecondaire: '#f1efe7',
  couleurTexte: '#102a43',
  borderRadius: 18,
};

export async function fetchWidgetSettings(): Promise<WidgetSettings> {
  return { ...widgetSettings };
}

export function buildWidgetEmbedCode(tokenPublic: string): string {
  return [
    '<script src="https://widget.resa.local/embed.js" defer></script>',
    `<div data-resa-widget="${tokenPublic}"></div>`,
  ].join('\n');
}
