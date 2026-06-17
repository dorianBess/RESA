import { NotFoundException } from '@nestjs/common';
import { ModifierTenantUseCase } from './modifier-tenant.use-case';
import {
  ITenantRepository,
  TenantDomain,
} from '../../domain/ports/tenant.repository.port';

describe('ModifierTenantUseCase', () => {
  let useCase: ModifierTenantUseCase;
  let mockRepo: jest.Mocked<ITenantRepository>;

  const tenantExistant: TenantDomain = {
    id: 'tenant-uuid',
    raisonSociale: 'Gîte Test',
    email: 'test@gite.fr',
    abonnementStatut: 'ACTIF',
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
    useCase = new ModifierTenantUseCase(mockRepo);
  });

  afterEach(() => jest.clearAllMocks());

  // TEST-TENANT-MOD-01 — Modification réussie
  it('TEST-TENANT-MOD-01: modifie la raison sociale du tenant', async () => {
    const tenantMis = { ...tenantExistant, raisonSociale: 'Nouveau Gîte' };
    mockRepo.update.mockResolvedValue(tenantMis);

    const result = await useCase.execute('tenant-uuid', {
      raisonSociale: 'Nouveau Gîte',
    });

    expect(result.raisonSociale).toBe('Nouveau Gîte');
    expect(mockRepo.update).toHaveBeenCalledWith('tenant-uuid', {
      raisonSociale: 'Nouveau Gîte',
    });
  });

  // TEST-TENANT-MOD-02 — Tenant introuvable
  it('TEST-TENANT-MOD-02: lève NotFoundException "Tenant introuvable"', async () => {
    mockRepo.update.mockResolvedValue(null);

    await expect(
      useCase.execute('uuid-inexistant', { raisonSociale: 'Test' }),
    ).rejects.toThrow(new NotFoundException('Tenant introuvable'));
  });

  // TEST-TENANT-MOD-03 — Modification de l'email
  it("TEST-TENANT-MOD-03: modifie l'email du tenant", async () => {
    const tenantMis = { ...tenantExistant, email: 'nouveau@gite.fr' };
    mockRepo.update.mockResolvedValue(tenantMis);

    const result = await useCase.execute('tenant-uuid', {
      email: 'nouveau@gite.fr',
    });

    expect(result.email).toBe('nouveau@gite.fr');
  });
});
