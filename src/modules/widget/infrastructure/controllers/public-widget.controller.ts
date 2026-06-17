import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  NotFoundException,
  Inject,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TenantEntity } from '@modules/tenant/infrastructure/entities/tenant.entity';
import { LogementEntity } from '@modules/logement/infrastructure/entities/logement.entity';
import { TarifBaseEntity } from '@modules/logement/infrastructure/entities/tarif-base.entity';
import { BlocageDatesEntity } from '@modules/logement/infrastructure/entities/blocage-dates.entity';
import { StatutLogement } from '@modules/logement/domain/ports/logement.repository.port';
import { CreerReservationUseCase } from '@modules/reservation/application/use-cases/creer-reservation.use-case';
import {
  IReservationRepository,
  RESERVATION_REPOSITORY,
} from '@modules/reservation/domain/ports/reservation.repository.port';

@Controller('widget')
export class PublicWidgetController {
  constructor(
    @InjectRepository(TenantEntity)
    private readonly tenantRepo: Repository<TenantEntity>,
    @InjectRepository(LogementEntity)
    private readonly logementRepo: Repository<LogementEntity>,
    @InjectRepository(TarifBaseEntity)
    private readonly tarifRepo: Repository<TarifBaseEntity>,
    @InjectRepository(BlocageDatesEntity)
    private readonly blocageRepo: Repository<BlocageDatesEntity>,
    private readonly creerReservation: CreerReservationUseCase,
    @Inject(RESERVATION_REPOSITORY)
    private readonly reservationRepo: IReservationRepository,
  ) {}

  private toDateStr(d: Date | string): string {
    return d instanceof Date
      ? d.toISOString().substring(0, 10)
      : String(d).substring(0, 10);
  }

  @Get(':token')
  async getByToken(@Param('token') token: string) {
    const tenant = await this.tenantRepo.findOne({
      where: { tokenPublicWidget: token },
    });
    if (!tenant) throw new NotFoundException('Widget introuvable');

    const config = tenant.widgetConfig ?? {};
    const logement = await this.logementRepo.findOne({
      where: { tenantId: tenant.id, statut: StatutLogement.ACTIF },
    });

    let tarifParNuit = 0;
    if (logement) {
      const tarif = await this.tarifRepo.findOne({
        where: { logementId: logement.id },
      });
      if (tarif) tarifParNuit = Number((tarif as any).prixParNuit ?? 0);
    }

    return {
      token,
      logementId: logement?.id ?? null,
      logementNom: logement?.nom ?? 'Logement de démonstration',
      capacite: logement?.capacite ?? 1,
      description: logement?.description ?? '',
      ville: logement?.description ?? '',
      tarifParNuit,
      devise: 'EUR',
      couleurPrimaire: config.couleurPrimaire ?? '#3B82F6',
      couleurSecondaire: config.couleurSecondaire ?? '#FFFFFF',
      couleurTexte: config.couleurTexte ?? '#111827',
      borderRadius: config.borderRadius ?? 8,
    };
  }

  @Get(':token/logements')
  async getLogements(@Param('token') token: string) {
    const tenant = await this.tenantRepo.findOne({
      where: { tokenPublicWidget: token },
    });
    if (!tenant) throw new NotFoundException('Widget introuvable');

    const logements = await this.logementRepo.find({
      where: { tenantId: tenant.id, statut: StatutLogement.ACTIF },
    });

    return Promise.all(
      logements.map(async (logement) => {
        const tarif = await this.tarifRepo.findOne({
          where: { logementId: logement.id },
        });
        return {
          id: logement.id,
          nom: logement.nom,
          description: logement.description ?? '',
          capacite: logement.capacite,
          ville: logement.description ?? '',
          tarifParNuit: tarif ? Number((tarif as any).prixParNuit ?? 0) : 0,
          devise: 'EUR',
        };
      }),
    );
  }

  @Get(':token/disponibilites')
  async checkDisponibilite(
    @Param('token') token: string,
    @Query('logementId') logementId: string,
    @Query('dateDebut') dateDebut: string,
    @Query('dateFin') dateFin: string,
  ) {
    const tenant = await this.tenantRepo.findOne({
      where: { tokenPublicWidget: token },
    });
    if (!tenant) throw new NotFoundException('Widget introuvable');

    const debut = new Date(dateDebut);
    const fin = new Date(dateFin);

    const conflict = await this.reservationRepo.existsConflict(
      logementId,
      debut,
      fin,
    );
    const holdActif = await this.reservationRepo.existsActiveHold(
      logementId,
      debut,
      fin,
    );

    if (conflict || holdActif) {
      return {
        disponible: false,
        motif: 'Ces dates ne sont plus disponibles.',
      };
    }

    const blocageConflict = await this.blocageRepo
      .createQueryBuilder('b')
      .where('b.logementId = :logementId', { logementId })
      .andWhere('b.tenantId = :tenantId', { tenantId: tenant.id })
      .andWhere('b.dateDebut < :fin', { fin: dateFin })
      .andWhere('b.dateFin > :debut', { debut: dateDebut })
      .getCount();

    if (blocageConflict > 0) {
      return {
        disponible: false,
        motif: "Ces dates sont bloquées par l'hébergeur.",
      };
    }

    return { disponible: true };
  }

  @Get(':token/blocages')
  async getBlockedRanges(
    @Param('token') token: string,
    @Query('logementId') logementId: string,
  ) {
    const tenant = await this.tenantRepo.findOne({
      where: { tokenPublicWidget: token },
    });
    if (!tenant) throw new NotFoundException('Widget introuvable');

    const reservations = await this.reservationRepo.findByLogement(
      logementId,
      tenant.id,
    );
    const blocages = await this.blocageRepo.find({
      where: { logementId, tenantId: tenant.id },
    });

    const fromReservations = reservations
      .filter((r) => r.statut !== 'ANNULEE' && r.statut !== 'REMBOURSEE')
      .map((r) => ({
        start: this.toDateStr(r.dateDebut),
        end: this.toDateStr(r.dateFin),
      }));

    const fromBlocages = blocages.map((b) => ({
      start: this.toDateStr(b.dateDebut),
      end: this.toDateStr(b.dateFin),
    }));

    return [...fromReservations, ...fromBlocages];
  }

  @Post(':token/reservations')
  async createReservation(@Param('token') token: string, @Body() body: any) {
    const tenant = await this.tenantRepo.findOne({
      where: { tokenPublicWidget: token },
    });
    if (!tenant) throw new NotFoundException('Widget introuvable');

    const logement = await this.logementRepo.findOne({
      where: { id: body.logementId, tenantId: tenant.id },
    });
    if (!logement) throw new NotFoundException('Logement introuvable');

    const tarif = await this.tarifRepo.findOne({
      where: { logementId: logement.id },
    });
    const prixParNuit = tarif ? Number((tarif as any).prixParNuit ?? 0) : 0;

    const result = await this.creerReservation.execute({
      tenantId: tenant.id,
      logementId: logement.id,
      dateDebut: new Date(body.dateDebut),
      dateFin: new Date(body.dateFin),
      nbPersonnes: Number(body.nbPersonnes),
      voyageurNom: body.voyageurNom,
      voyageurPrenom: body.voyageurPrenom,
      voyageurEmail: body.voyageurEmail,
      voyageurTelephone: body.voyageurTelephone,
      notes: body.notes,
      logement: {
        id: logement.id,
        tenantId: tenant.id,
        capacite: logement.capacite,
        prixParNuit,
      },
    });

    return {
      reference: result.reservation.id,
      statut: result.reservation.statut,
    };
  }
}
