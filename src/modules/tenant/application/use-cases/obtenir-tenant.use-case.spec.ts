import { NotFoundException } from '@nestjs/common';
import { ObtenirTenantUseCase } from './obtenir-tenant.use-case';
import { ITenantRepository, TenantDomain } from '../../domain/ports/tenant.repository.port';

describe('ObtenirTenantUseCase', () => {
  let useCase: ObtenirTenantUseCase;
  let mockRepo: jest.Mocked<ITenantRepository>;

  const tenant: TenantDomain = {
    id: 'tenant-uuid', raisonSociale: 'Gîte des Pins', email: 'pins@gite.fr',
    abonnementStatut: 'ACTIF', abonnementDebut: null, abonnementFin: null,
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
    useCase = new ObtenirTenantUseCase(mockRepo);
  });

  afterEach(() => jest.clearAllMocks());

  // TEST-TENANT-GET-01 — Tenant trouvé
  it('TEST-TENANT-GET-01: retourne le tenant correspondant à l\'id', async () => {
    mockRepo.findById.mockResolvedValue(tenant);

    const result = await useCase.execute('tenant-uuid');

    expect(result.id).toBe('tenant-uuid');
    expect(result.raisonSociale).toBe('Gîte des Pins');
    expect(mockRepo.findById).toHaveBeenCalledWith('tenant-uuid');
  });

  // TEST-TENANT-GET-02 — Tenant introuvable
  it('TEST-TENANT-GET-02: lève NotFoundException "Tenant introuvable"', async () => {
    mockRepo.findById.mockResolvedValue(null);

    await expect(
      useCase.execute('uuid-inexistant'),
    ).rejects.toThrow(new NotFoundException('Tenant introuvable'));
  });
});
