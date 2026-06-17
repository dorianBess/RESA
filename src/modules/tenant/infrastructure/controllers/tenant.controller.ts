import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '@shared/guards/jwt-auth.guard';
import { ListerTenantsUseCase } from '../../application/use-cases/lister-tenants.use-case';
import { ObtenirTenantUseCase } from '../../application/use-cases/obtenir-tenant.use-case';
import { CreerTenantUseCase } from '../../application/use-cases/creer-tenant.use-case';
import { ModifierTenantUseCase } from '../../application/use-cases/modifier-tenant.use-case';
import { ModifierStatutTenantUseCase } from '../../application/use-cases/modifier-statut-tenant.use-case';
import { CreerTenantDto } from '../dtos/creer-tenant.dto';
import { ModifierTenantDto } from '../dtos/modifier-tenant.dto';
import { ModifierStatutDto } from '../dtos/modifier-statut.dto';

@Controller('tenants')
@UseGuards(JwtAuthGuard)
export class TenantController {
  constructor(
    private readonly lister: ListerTenantsUseCase,
    private readonly obtenir: ObtenirTenantUseCase,
    private readonly creer: CreerTenantUseCase,
    private readonly modifier: ModifierTenantUseCase,
    private readonly modifierStatut: ModifierStatutTenantUseCase,
  ) {}

  @Get()
  findAll() {
    return this.lister.execute();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.obtenir.execute(id);
  }

  @Post()
  create(@Body() dto: CreerTenantDto) {
    return this.creer.execute(dto);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() dto: ModifierTenantDto) {
    return this.modifier.execute(id, dto);
  }

  @Patch(':id/statut')
  updateStatut(@Param('id') id: string, @Body() dto: ModifierStatutDto) {
    return this.modifierStatut.execute(id, dto.statut);
  }
}
