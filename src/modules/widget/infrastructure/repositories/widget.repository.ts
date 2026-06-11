import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IWidgetRepository, WidgetConfigDomain, WidgetConfig } from '../../domain/ports/widget.repository.port';
import { TenantEntity } from '@modules/tenant/infrastructure/entities/tenant.entity';

function generateToken(): string {
  return `wt_${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`;
}

function buildCodeHtml(tokenPublic: string): string {
  return `<script src="https://api.resa.fr/widget.js" data-token="${tokenPublic}"></script>`;
}

@Injectable()
export class WidgetRepository implements IWidgetRepository {
  constructor(
    @InjectRepository(TenantEntity)
    private readonly repo: Repository<TenantEntity>,
  ) {}

  async findByTenantId(tenantId: string): Promise<WidgetConfigDomain | null> {
    const tenant = await this.repo.findOne({ where: { id: tenantId } });
    if (!tenant || !tenant.tokenPublicWidget) return null;
    return this.toWidgetDomain(tenant);
  }

  async upsert(tenantId: string, updates: Partial<WidgetConfig>): Promise<WidgetConfigDomain> {
    const tenant = await this.repo.findOne({ where: { id: tenantId } });
    if (!tenant) throw new Error('Tenant introuvable');

    const existingConfig = tenant.widgetConfig ?? {};
    const newConfig = { ...existingConfig, ...updates };
    const token = tenant.tokenPublicWidget ?? generateToken();

    await this.repo.update(tenantId, {
      widgetConfig: newConfig as any,
      tokenPublicWidget: token,
    });

    const updated = await this.repo.findOne({ where: { id: tenantId } });
    return this.toWidgetDomain(updated!);
  }

  async regenererToken(tenantId: string): Promise<WidgetConfigDomain> {
    const newToken = generateToken();
    await this.repo.update(tenantId, { tokenPublicWidget: newToken });
    const tenant = await this.repo.findOne({ where: { id: tenantId } });
    return this.toWidgetDomain(tenant!);
  }

  private toWidgetDomain(tenant: TenantEntity): WidgetConfigDomain {
    const config = tenant.widgetConfig as any ?? {};
    const token = tenant.tokenPublicWidget ?? '';
    return {
      tenantId: tenant.id,
      tokenPublic: token,
      config: {
        couleurPrimaire: config.couleurPrimaire ?? '#3B82F6',
        couleurSecondaire: config.couleurSecondaire ?? '#1E3A5F',
        couleurTexte: config.couleurTexte ?? '#FFFFFF',
        police: config.police ?? 'Inter',
        borderRadius: config.borderRadius ?? 8,
        logoUrl: config.logoUrl,
      },
      codeHtml: buildCodeHtml(token),
    };
  }
}
