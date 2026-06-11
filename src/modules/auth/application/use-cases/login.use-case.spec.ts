import { UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { LoginUseCase } from './login.use-case';
import { IAuthRepository } from '../../domain/ports/auth.repository.port';

jest.mock('bcryptjs');

describe('LoginUseCase', () => {
  let useCase: LoginUseCase;
  let mockRepo: jest.Mocked<IAuthRepository>;
  let mockJwt: jest.Mocked<Pick<JwtService, 'sign'>>;

  const mockTenant = {
    id: 'tenant-uuid-001',
    email: 'contact@gites-provence.fr',
    motDePasseHash: '$2b$10$hashed',
    raisonSociale: 'Gîtes Provence',
    abonnementStatut: 'ACTIF',
  };

  beforeEach(() => {
    mockRepo = {
      findByEmail: jest.fn(),
      emailExists: jest.fn(),
      createTenant: jest.fn(),
    };
    mockJwt = { sign: jest.fn().mockReturnValue('jwt.token.valid') };
    useCase = new LoginUseCase(mockRepo, mockJwt as unknown as JwtService);
  });

  afterEach(() => jest.clearAllMocks());

  // TEST-AUTH-01 — Connexion réussie
  it('TEST-AUTH-01: retourne accessToken + expiresAt quand credentials valides', async () => {
    mockRepo.findByEmail.mockResolvedValue(mockTenant);
    (bcrypt.compare as jest.Mock).mockResolvedValue(true);

    const result = await useCase.execute('contact@gites-provence.fr', 'motdepasse123');

    expect(result.accessToken).toBe('jwt.token.valid');
    expect(result.expiresAt).toBeInstanceOf(Date);
    expect(mockJwt.sign).toHaveBeenCalledWith(
      expect.objectContaining({ sub: 'tenant-uuid-001' }),
    );
  });

  // TEST-AUTH-02 — Mot de passe incorrect
  it('TEST-AUTH-02: lève UnauthorizedException "Identifiants invalides" quand mauvais mot de passe', async () => {
    mockRepo.findByEmail.mockResolvedValue(mockTenant);
    (bcrypt.compare as jest.Mock).mockResolvedValue(false);

    await expect(
      useCase.execute('contact@gites-provence.fr', 'mauvais-mdp'),
    ).rejects.toThrow(new UnauthorizedException('Identifiants invalides'));
  });

  // TEST-AUTH-03 — Email inexistant (même message — pas de fuite d'info)
  it('TEST-AUTH-03: lève UnauthorizedException avec même message quand email inexistant', async () => {
    mockRepo.findByEmail.mockResolvedValue(null);

    await expect(
      useCase.execute('inconnu@test.fr', 'n-importe'),
    ).rejects.toThrow(new UnauthorizedException('Identifiants invalides'));
  });
});
