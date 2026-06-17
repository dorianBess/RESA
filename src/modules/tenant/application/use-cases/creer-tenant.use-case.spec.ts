import { BadRequestException, ConflictException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { CreerTenantUseCase } from './creer-tenant.use-case';
import { ITenantRepository } from '../../domain/ports/tenant.repository.port';

jest.mock('bcryptjs');

describe('CreerTenantUseCase', () => {
  let useCase: CreerTenantUseCase;
  let mockRepo: jest.Mocked<ITenantRepository>;

  const tenantCree = {
    id: 'new-tenant-uuid',
    raisonSociale: 'Nouveau Gîte',
    email: 'nouveau@gites.fr',
    abonnementStatut: 'ESSAI',
    abonnementDebut: null,
    abonnementFin: null,
  };

  beforeEach(() => {
    mockRepo = {
      findAll: jest.fn(),
      findById: jest.fn(),
      emailExists: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      updateStatut: jest.fn(),
    };
    useCase = new CreerTenantUseCase(mockRepo);
    (bcrypt.hash as jest.Mock).mockResolvedValue('$2b$10$hashed');
  });

  afterEach(() => jest.clearAllMocks());

  // TEST-TENANT-01 — Création réussie
  it('TEST-TENANT-01: crée tenant avec statut ESSAI et id UUID', async () => {
    mockRepo.emailExists.mockResolvedValue(false);
    mockRepo.create.mockResolvedValue(tenantCree);

    const result = await useCase.execute({
      raisonSociale: 'Nouveau Gîte',
      email: 'nouveau@gites.fr',
      motDePasse: 'secret123',
    });

    expect(result.abonnementStatut).toBe('ESSAI');
    expect(result.id).toBe('new-tenant-uuid');
    expect(mockRepo.create).toHaveBeenCalledWith(
      expect.objectContaining({ email: 'nouveau@gites.fr' }),
    );
  });

  // TEST-TENANT-02 — Email déjà utilisé
  it('TEST-TENANT-02: lève ConflictException "Cet email est déjà utilisé"', async () => {
    mockRepo.emailExists.mockResolvedValue(true);

    await expect(
      useCase.execute({
        raisonSociale: 'Doublon',
        email: 'existant@gites.fr',
        motDePasse: 'secret',
      }),
    ).rejects.toThrow(new ConflictException('Cet email est déjà utilisé'));
  });

  // TEST-TENANT-03 — Email manquant
  it('TEST-TENANT-03: lève BadRequestException "Le champ email est obligatoire"', async () => {
    await expect(
      useCase.execute({
        raisonSociale: 'Test',
        email: '',
        motDePasse: 'secret',
      }),
    ).rejects.toThrow(
      new BadRequestException('Le champ email est obligatoire'),
    );
  });
});
