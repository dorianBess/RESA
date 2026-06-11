import { Injectable, Inject, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import {
  AUTH_REPOSITORY,
  IAuthRepository,
} from '../../domain/ports/auth.repository.port';

export interface RegisterCommand {
  raisonSociale: string;
  email: string;
  motDePasse: string;
}

export interface RegisterResult {
  accessToken: string;
  tenantId: string;
}

@Injectable()
export class RegisterUseCase {
  constructor(
    @Inject(AUTH_REPOSITORY) private readonly authRepository: IAuthRepository,
    private readonly jwtService: JwtService,
  ) {}

  async execute(command: RegisterCommand): Promise<RegisterResult> {
    const exists = await this.authRepository.emailExists(command.email);
    if (exists) {
      throw new ConflictException('Cet email est déjà utilisé');
    }
    const motDePasseHash = await bcrypt.hash(command.motDePasse, 10);
    const tenant = await this.authRepository.createTenant({
      raisonSociale: command.raisonSociale,
      email: command.email,
      motDePasseHash,
    });
    const payload = { sub: tenant.id, email: tenant.email, tenantId: tenant.id };
    const accessToken = this.jwtService.sign(payload);
    return { accessToken, tenantId: tenant.id };
  }
}
