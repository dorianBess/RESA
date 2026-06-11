import { Injectable, Inject } from '@nestjs/common';
import { WIDGET_REPOSITORY, IWidgetRepository, WidgetConfigDomain } from '../../domain/ports/widget.repository.port';

@Injectable()
export class ObtenirConfigWidgetUseCase {
  constructor(
    @Inject(WIDGET_REPOSITORY) private readonly widgetRepository: IWidgetRepository,
  ) {}

  async execute(tenantId: string): Promise<WidgetConfigDomain> {
    const config = await this.widgetRepository.findByTenantId(tenantId);
    if (config) return config;
    // Créer config par défaut si inexistante
    return this.widgetRepository.upsert(tenantId, {
      couleurPrimaire: '#3B82F6',
      couleurSecondaire: '#1E3A5F',
      couleurTexte: '#FFFFFF',
      police: 'Inter',
      borderRadius: 8,
    });
  }
}
