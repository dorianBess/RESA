import { ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { RegisterUseCase } from './register.use-case';
import { IAuthRepository } from '../../domain/ports/auth.repository.port';

jest.mock('bcryptjs');

describe('RegisterUseCase', () => {
  let useCase: RegisterUseCase;
  let mockRepo: jest.Mocked<IAuthRepository>;
  let mockJwt: jest.Mocked<Pick<JwtService, 'sign'>>;

  beforeEach(() => {
    mockRepo = {
      findByEmail: jest.fn(),
      emailExists: jest.fn(),
      createTenant: jest.fn(),
    };
    mockJwt = { sign: jest.fn().mockReturnValue('jwt.token') };
    useCase = new RegisterUseCase(mockRepo, mockJwt as unknown as JwtService);
    (bcrypt.hash as jest.Mock).mockResolvedValue('$2b$10$hashed');
  });

  afterEach(() => jest.clearAllMocks());

  it('crée un tenant et retourne accessToken quand email inédit', async () => {
    mockRepo.emailExists.mockResolvedValue(false);
    mockRepo.createTenant.mockResolvedValue({
      id: 'new-uuid',
      email: 'nouveau@gites.fr',
      motDePasseHash: '$2b$10$hashed',
      raisonSociale: 'Nouveau Gîte',
      abonnementStatut: 'ESSAI',
    });

    const result = await useCase.execute({
      raisonSociale: 'Nouveau Gîte',
      email: 'nouveau@gites.fr',
      motDePasse: 'secret123',
    });

    expect(result.accessToken).toBe('jwt.token');
    expect(result.tenantId).toBe('new-uuid');
  });

  it('lève ConflictException quand email déjà utilisé', async () => {
    mockRepo.emailExists.mockResolvedValue(true);

    await expect(
      useCase.execute({
        raisonSociale: 'Test',
        email: 'existant@gites.fr',
        motDePasse: 'secret',
      }),
    ).rejects.toThrow(new ConflictException('Cet email est déjà utilisé'));
  });
});
