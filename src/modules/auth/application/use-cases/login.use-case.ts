import { Injectable, Inject, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import {
  AUTH_REPOSITORY,
  IAuthRepository,
} from '../../domain/ports/auth.repository.port';

export interface LoginResult {
  accessToken: string;
  expiresAt: Date;
}

@Injectable()
export class LoginUseCase {
  constructor(
    @Inject(AUTH_REPOSITORY) private readonly authRepository: IAuthRepository,
    private readonly jwtService: JwtService,
  ) {}

  async execute(email: string, motDePasse: string): Promise<LoginResult> {
    const tenant = await this.authRepository.findByEmail(email);
    if (!tenant) {
      throw new UnauthorizedException('Identifiants invalides');
    }
    const isValid = await bcrypt.compare(motDePasse, tenant.motDePasseHash);
    if (!isValid) {
      throw new UnauthorizedException('Identifiants invalides');
    }
    const payload = {
      sub: tenant.id,
      email: tenant.email,
      tenantId: tenant.id,
    };
    const accessToken = this.jwtService.sign(payload);
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
    return { accessToken, expiresAt };
  }
}
