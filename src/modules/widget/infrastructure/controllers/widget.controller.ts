import { Body, Controller, Get, Post, Put, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '@shared/guards/jwt-auth.guard';
import { CurrentTenant, TenantPayload } from '@shared/decorators/current-tenant.decorator';
import { ObtenirConfigWidgetUseCase } from '../../application/use-cases/obtenir-config-widget.use-case';
import { ModifierConfigWidgetUseCase } from '../../application/use-cases/modifier-config-widget.use-case';
import { RegenerarTokenWidgetUseCase } from '../../application/use-cases/regenerer-token-widget.use-case';

@Controller('config/widget')
@UseGuards(JwtAuthGuard)
export class WidgetController {
  constructor(
    private readonly obtenir: ObtenirConfigWidgetUseCase,
    private readonly modifier: ModifierConfigWidgetUseCase,
    private readonly regenerer: RegenerarTokenWidgetUseCase,
  ) {}

  @Get()
  getConfig(@CurrentTenant() t: TenantPayload) {
    return this.obtenir.execute(t.tenantId);
  }

  @Put()
  updateConfig(@CurrentTenant() t: TenantPayload, @Body() body: any) {
    return this.modifier.execute(t.tenantId, body);
  }

  @Post('regenerer-token')
  regenererToken(@CurrentTenant() t: TenantPayload) {
    return this.regenerer.execute(t.tenantId);
  }
}
