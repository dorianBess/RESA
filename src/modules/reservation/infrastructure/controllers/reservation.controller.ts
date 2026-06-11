import {
  Body, Controller, Get, Param, Patch, Post, Query, UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '@shared/guards/jwt-auth.guard';
import { CurrentTenant } from '@shared/decorators/current-tenant.decorator';
import { CreerReservationUseCase } from '../../application/use-cases/creer-reservation.use-case';
import { AnnulerReservationUseCase } from '../../application/use-cases/annuler-reservation.use-case';
import { IReservationRepository, RESERVATION_REPOSITORY } from '../../domain/ports/reservation.repository.port';
import { Inject } from '@nestjs/common';

@Controller('reservations')
export class ReservationController {
  constructor(
    private readonly creerReservation: CreerReservationUseCase,
    private readonly annulerReservation: AnnulerReservationUseCase,
    @Inject(RESERVATION_REPOSITORY) private readonly reservationRepo: IReservationRepository,
  ) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  findAll(@CurrentTenant() tenant: { tenantId: string }, @Query() query: any) {
    return this.reservationRepo.findByLogement(query.logementId ?? '', tenant.tenantId);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  findOne(@Param('id') id: string, @CurrentTenant() tenant: { tenantId: string }) {
    return this.reservationRepo.findById(id, tenant.tenantId);
  }

  @Post()
  create(@Body() body: any) {
    return this.creerReservation.execute(body);
  }

  @Patch(':id/annuler')
  @UseGuards(JwtAuthGuard)
  annuler(@Param('id') id: string, @CurrentTenant() tenant: { tenantId: string }) {
    return this.annulerReservation.execute(id, tenant.tenantId);
  }
}
