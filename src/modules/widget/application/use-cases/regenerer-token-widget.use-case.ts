import { Injectable, Inject } from '@nestjs/common';
import { WIDGET_REPOSITORY, IWidgetRepository, WidgetConfigDomain } from '../../domain/ports/widget.repository.port';

@Injectable()
export class RegenerarTokenWidgetUseCase {
  constructor(
    @Inject(WIDGET_REPOSITORY) private readonly widgetRepository: IWidgetRepository,
  ) {}

  async execute(tenantId: string): Promise<WidgetConfigDomain> {
    return this.widgetRepository.regenererToken(tenantId);
  }
}
