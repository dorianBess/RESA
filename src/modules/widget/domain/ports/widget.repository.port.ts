export const WIDGET_REPOSITORY = Symbol('WIDGET_REPOSITORY');

export interface WidgetConfig {
  couleurPrimaire: string;
  couleurSecondaire: string;
  couleurTexte: string;
  police: string;
  borderRadius: number;
  logoUrl?: string;
}

export interface WidgetConfigDomain {
  tenantId: string;
  tokenPublic: string;
  config: WidgetConfig;
  codeHtml: string;
}

export interface IWidgetRepository {
  findByTenantId(tenantId: string): Promise<WidgetConfigDomain | null>;
  upsert(tenantId: string, config: Partial<WidgetConfig>): Promise<WidgetConfigDomain>;
  regenererToken(tenantId: string): Promise<WidgetConfigDomain>;
}
