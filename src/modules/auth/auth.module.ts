import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { TenantEntity } from '@modules/tenant/infrastructure/entities/tenant.entity';

import { AuthController } from './infrastructure/controllers/auth.controller';
import { AuthRepository } from './infrastructure/repositories/auth.repository';
import { JwtStrategy } from './infrastructure/strategies/jwt.strategy';
import { AUTH_REPOSITORY } from './domain/ports/auth.repository.port';
import { LoginUseCase } from './application/use-cases/login.use-case';
import { RegisterUseCase } from './application/use-cases/register.use-case';

@Module({
  imports: [
    PassportModule,
    TypeOrmModule.forFeature([TenantEntity]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (config: ConfigService) => ({
        secret: config.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: '24h' },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [AuthController],
  providers: [
    LoginUseCase,
    RegisterUseCase,
    JwtStrategy,
    { provide: AUTH_REPOSITORY, useClass: AuthRepository },
  ],
  exports: [JwtModule],
})
export class AuthModule {}
