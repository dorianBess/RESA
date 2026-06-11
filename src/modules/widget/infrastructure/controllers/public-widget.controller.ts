import { Controller, Get, Param, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TenantEntity } from '@modules/tenant/infrastructure/entities/tenant.entity';
import { LogementEntity } from '@modules/logement/infrastructure/entities/logement.entity';
import { TarifBaseEntity } from '@modules/logement/infrastructure/entities/tarif-base.entity';
import { StatutLogement } from '@modules/logement/domain/ports/logement.repository.port';

@Controller('widget')
export class PublicWidgetController {
  constructor(
    @InjectRepository(TenantEntity)
    private readonly tenantRepo: Repository<TenantEntity>,
    @InjectRepository(LogementEntity)
    private readonly logementRepo: Repository<LogementEntity>,
    @InjectRepository(TarifBaseEntity)
    private readonly tarifRepo: Repository<TarifBaseEntity>,
  ) {}

  @Get(':token')
  async getByToken(@Param('token') token: string) {
    const tenant = await this.tenantRepo.findOne({ where: { tokenPublicWidget: token } });
    if (!tenant) throw new NotFoundException('Widget introuvable');

    const config = tenant.widgetConfig ?? {};

    // Try to find a default logement for this tenant (first ACTIF logement)
    const logement = await this.logementRepo.findOne({ where: { tenantId: tenant.id, statut: StatutLogement.ACTIF } });

    let tarifParNuit = 0;
    if (logement) {
      const tarif = await this.tarifRepo.findOne({ where: { logementId: logement.id } });
      if (tarif) tarifParNuit = (tarif as any).prixParNuit ?? 0;
    }

    return {
      token,
      logementId: logement?.id ?? null,
      logementNom: logement?.nom ?? 'Logement de démonstration',
      capacite: logement?.capacite ?? 1,
      description: logement?.description ?? '',
      tarifParNuit,
      devise: 'EUR',
      couleurPrimaire: config.couleurPrimaire ?? '#3B82F6',
      couleurSecondaire: config.couleurSecondaire ?? '#FFFFFF',
      couleurTexte: config.couleurTexte ?? '#111827',
      borderRadius: config.borderRadius ?? 8,
    };
  }
}
