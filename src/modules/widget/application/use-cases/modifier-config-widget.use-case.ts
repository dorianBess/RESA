import { Injectable, Inject, BadRequestException } from '@nestjs/common';
import { WIDGET_REPOSITORY, IWidgetRepository, WidgetConfig, WidgetConfigDomain } from '../../domain/ports/widget.repository.port';

const HEX_COLOR_REGEX = /^#[0-9A-Fa-f]{6}$/;

@Injectable()
export class ModifierConfigWidgetUseCase {
  constructor(
    @Inject(WIDGET_REPOSITORY) private readonly widgetRepository: IWidgetRepository,
  ) {}

  async execute(tenantId: string, updates: Partial<WidgetConfig>): Promise<WidgetConfigDomain> {
    for (const key of ['couleurPrimaire', 'couleurSecondaire', 'couleurTexte'] as const) {
      if (updates[key] !== undefined && !HEX_COLOR_REGEX.test(updates[key]!)) {
        throw new BadRequestException('Format de couleur invalide. Format attendu : #RRGGBB');
      }
    }
    return this.widgetRepository.upsert(tenantId, updates);
  }
}
