import {
  Body, Controller, Delete, Get, Param, Post, Put, Query, UseGuards, UploadedFile, UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '@shared/guards/jwt-auth.guard';
import { CurrentTenant, TenantPayload } from '@shared/decorators/current-tenant.decorator';
import { ListerLogementsUseCase } from '../../application/use-cases/lister-logements.use-case';
import { ObtenirLogementUseCase } from '../../application/use-cases/obtenir-logement.use-case';
import { CreerLogementUseCase } from '../../application/use-cases/creer-logement.use-case';
import { ModifierLogementUseCase } from '../../application/use-cases/modifier-logement.use-case';
import { ArchiverLogementUseCase } from '../../application/use-cases/archiver-logement.use-case';
import { VerifierDisponibiliteCompletUseCase } from '../../application/use-cases/verifier-disponibilite-complet.use-case';
import { UploaderPhotoUseCase } from '../../application/use-cases/uploader-photo.use-case';
import { SupprimerPhotoUseCase } from '../../application/use-cases/supprimer-photo.use-case';
import { ReordonnerPhotosUseCase } from '../../application/use-cases/reordonner-photos.use-case';
import { UpsertTarifBaseUseCase } from '../../application/use-cases/upsert-tarif-base.use-case';
import { CreerTarifSaisonnierUseCase } from '../../application/use-cases/creer-tarif-saisonnier.use-case';
import { ModifierTarifSaisonnierUseCase } from '../../application/use-cases/modifier-tarif-saisonnier.use-case';
import { SupprimerTarifSaisonnierUseCase } from '../../application/use-cases/supprimer-tarif-saisonnier.use-case';
import { CreerBlocageUseCase } from '../../application/use-cases/creer-blocage.use-case';
import { SupprimerBlocageUseCase } from '../../application/use-cases/supprimer-blocage.use-case';
import { UpsertConfigAcompteUseCase } from '../../application/use-cases/upsert-config-acompte.use-case';
import { ConfigurerIcalUseCase } from '../../application/use-cases/configurer-ical.use-case';
import { SynchroniserIcalUseCase } from '../../application/use-cases/synchroniser-ical.use-case';
import { TARIF_REPOSITORY, ITarifRepository } from '../../domain/ports/tarif.repository.port';
import { BLOCAGE_REPOSITORY, IBlocageRepository } from '../../domain/ports/blocage.repository.port';
import { Inject } from '@nestjs/common';

@Controller('logements')
@UseGuards(JwtAuthGuard)
export class LogementController {
  constructor(
    private readonly lister: ListerLogementsUseCase,
    private readonly obtenir: ObtenirLogementUseCase,
    private readonly creer: CreerLogementUseCase,
    private readonly modifier: ModifierLogementUseCase,
    private readonly archiver: ArchiverLogementUseCase,
    private readonly verifierDispo: VerifierDisponibiliteCompletUseCase,
    private readonly uploaderPhoto: UploaderPhotoUseCase,
    private readonly supprimerPhoto: SupprimerPhotoUseCase,
    private readonly reordonnerPhotos: ReordonnerPhotosUseCase,
    private readonly upsertTarifBase: UpsertTarifBaseUseCase,
    private readonly creerTarifSaisonnier: CreerTarifSaisonnierUseCase,
    private readonly modifierTarifSaisonnier: ModifierTarifSaisonnierUseCase,
    private readonly supprimerTarifSaisonnier: SupprimerTarifSaisonnierUseCase,
    private readonly creerBlocage: CreerBlocageUseCase,
    private readonly supprimerBlocage: SupprimerBlocageUseCase,
    private readonly upsertAcompte: UpsertConfigAcompteUseCase,
    private readonly configurerIcal: ConfigurerIcalUseCase,
    private readonly synchroniserIcal: SynchroniserIcalUseCase,
    @Inject(TARIF_REPOSITORY) private readonly tarifRepo: ITarifRepository,
    @Inject(BLOCAGE_REPOSITORY) private readonly blocageRepo: IBlocageRepository,
  ) {}

  @Get()
  findAll(@CurrentTenant() t: TenantPayload, @Query() q: any) {
    return this.lister.execute(t.tenantId, q);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @CurrentTenant() t: TenantPayload) {
    return this.obtenir.execute(id, t.tenantId);
  }

  @Post()
  create(@Body() body: any, @CurrentTenant() t: TenantPayload) {
    return this.creer.execute({ ...body, tenantId: t.tenantId });
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() body: any, @CurrentTenant() t: TenantPayload) {
    return this.modifier.execute({ id, tenantId: t.tenantId, data: body });
  }

  @Delete(':id')
  archive(@Param('id') id: string, @CurrentTenant() t: TenantPayload) {
    return this.archiver.execute(id, t.tenantId);
  }

  @Get(':id/disponibilites')
  disponibilites(@Param('id') id: string, @Query() q: any, @CurrentTenant() t: TenantPayload) {
    return this.verifierDispo.execute({
      logementId: id, tenantId: t.tenantId,
      dateDebut: new Date(q.dateDebut), dateFin: new Date(q.dateFin),
      nbPersonnes: parseInt(q.nbPersonnes, 10),
    });
  }

  @Post(':id/photos')
  @UseInterceptors(FileInterceptor('file'))
  uploadPhoto(@Param('id') id: string, @UploadedFile() file: Express.Multer.File, @Body() body: any, @CurrentTenant() t: TenantPayload) {
    return this.uploaderPhoto.execute({
      logementId: id, tenantId: t.tenantId,
      buffer: file.buffer, originalname: file.originalname,
      mimetype: file.mimetype, size: file.size, ordre: body.ordre,
    });
  }

  @Delete(':id/photos/:photoId')
  deletePhoto(@Param('photoId') photoId: string, @CurrentTenant() t: TenantPayload) {
    return this.supprimerPhoto.execute(photoId, t.tenantId);
  }

  @Put(':id/photos/ordre')
  reorderPhotos(@Body() body: { ordre: string[] }) {
    return this.reordonnerPhotos.execute(body.ordre);
  }

  @Get(':id/tarifs')
  async getTarifs(@Param('id') id: string) {
    const [tarifBase, tarifsSaisonniers] = await Promise.all([
      this.tarifRepo.findBase(id), this.tarifRepo.findSaisonniers(id),
    ]);
    return { tarifBase, tarifsSaisonniers };
  }

  @Put(':id/tarifs/base')
  upsertTarif(@Param('id') id: string, @Body() body: any, @CurrentTenant() t: TenantPayload) {
    return this.upsertTarifBase.execute({ logementId: id, tenantId: t.tenantId, ...body });
  }

  @Post(':id/tarifs/saisonniers')
  createTarifSaisonnier(@Param('id') id: string, @Body() body: any, @CurrentTenant() t: TenantPayload) {
    return this.creerTarifSaisonnier.execute({
      logementId: id, tenantId: t.tenantId,
      ...body, dateDebut: new Date(body.dateDebut), dateFin: new Date(body.dateFin),
    });
  }

  @Put(':id/tarifs/saisonniers/:tarifId')
  updateTarifSaisonnier(@Param('tarifId') tarifId: string, @Body() body: any, @CurrentTenant() t: TenantPayload) {
    return this.modifierTarifSaisonnier.execute(tarifId, t.tenantId, body);
  }

  @Delete(':id/tarifs/saisonniers/:tarifId')
  deleteTarifSaisonnier(@Param('tarifId') tarifId: string, @CurrentTenant() t: TenantPayload) {
    return this.supprimerTarifSaisonnier.execute(tarifId, t.tenantId);
  }

  @Get(':id/blocages')
  getBlocages(@Param('id') id: string, @Query() q: any, @CurrentTenant() t: TenantPayload) {
    return this.blocageRepo.findByLogement(id, t.tenantId, q);
  }

  @Post(':id/blocages')
  createBlocage(@Param('id') id: string, @Body() body: any, @CurrentTenant() t: TenantPayload) {
    return this.creerBlocage.execute({
      logementId: id, tenantId: t.tenantId,
      dateDebut: new Date(body.dateDebut), dateFin: new Date(body.dateFin), motif: body.motif,
    });
  }

  @Delete(':id/blocages/:blocageId')
  deleteBlocage(@Param('blocageId') blocageId: string, @CurrentTenant() t: TenantPayload) {
    return this.supprimerBlocage.execute(blocageId, t.tenantId);
  }

  @Get(':id/config-acompte')
  getConfigAcompte(@Param('id') id: string) {
    return this.upsertAcompte;
  }

  @Put(':id/config-acompte')
  upsertConfigAcompte(@Param('id') id: string, @Body() body: any, @CurrentTenant() t: TenantPayload) {
    return this.upsertAcompte.execute({ logementId: id, tenantId: t.tenantId, ...body });
  }

  @Put(':id/ical')
  configurerIcalUrls(@Param('id') id: string, @Body() body: any, @CurrentTenant() t: TenantPayload) {
    return this.configurerIcal.execute({ logementId: id, tenantId: t.tenantId, ...body });
  }

  @Post(':id/ical/synchroniser')
  async synchroniser(@Param('id') id: string, @CurrentTenant() t: TenantPayload) {
    await this.synchroniserIcal.execute(id, t.tenantId, t.email, id);
    return { message: 'Synchronisation déclenchée' };
  }

  @Get(':id/ical/export')
  exportIcal(@Param('id') id: string) {
    return { urlIcal: `https://api.resa.fr/ical/logement/${id}.ics` };
  }
}
