import {
  Injectable,
  Inject,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import {
  TENANT_REPOSITORY,
  ITenantRepository,
  TenantDomain,
} from '../../domain/ports/tenant.repository.port';

export interface CreerTenantCommand {
  raisonSociale: string;
  email: string;
  motDePasse: string;
}

@Injectable()
export class CreerTenantUseCase {
  constructor(
    @Inject(TENANT_REPOSITORY)
    private readonly tenantRepository: ITenantRepository,
  ) {}

  async execute(command: CreerTenantCommand): Promise<TenantDomain> {
    if (!command.email) {
      throw new BadRequestException('Le champ email est obligatoire');
    }
    const exists = await this.tenantRepository.emailExists(command.email);
    if (exists) {
      throw new ConflictException('Cet email est déjà utilisé');
    }
    const motDePasseHash = await bcrypt.hash(command.motDePasse, 10);
    return this.tenantRepository.create({
      raisonSociale: command.raisonSociale,
      email: command.email,
      motDePasseHash,
    });
  }
}
