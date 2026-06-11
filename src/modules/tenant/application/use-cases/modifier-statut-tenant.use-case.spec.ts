import { BadRequestException, NotFoundException } from '@nestjs/common';
import { ModifierStatutTenantUseCase } from './modifier-statut-tenant.use-case';
import { ITenantRepository } from '../../domain/ports/tenant.repository.port';

describe('ModifierStatutTenantUseCase', () => {
  let useCase: ModifierStatutTenantUseCase;
  let mockRepo: jest.Mocked<ITenantRepository>;

  const tenantActif = {
    id: 'tenant-uuid-actif',
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
    useCase = new ModifierStatutTenantUseCase(mockRepo);
  });

  afterEach(() => jest.clearAllMocks());

  // TEST-TENANT-04 — Suspension abonnement
  it('TEST-TENANT-04: passe tenant en statut SUSPENDU', async () => {
    mockRepo.updateStatut.mockResolvedValue({ ...tenantActif, abonnementStatut: 'SUSPENDU' });

    const result = await useCase.execute('tenant-uuid-actif', 'SUSPENDU');

    expect(result.abonnementStatut).toBe('SUSPENDU');
    expect(mockRepo.updateStatut).toHaveBeenCalledWith('tenant-uuid-actif', 'SUSPENDU');
  });

  // TEST-TENANT-05 — Statut invalide
  it('TEST-TENANT-05: lève BadRequestException "Statut invalide"', async () => {
    await expect(
      useCase.execute('tenant-uuid', 'INCONNU'),
    ).rejects.toThrow(new BadRequestException('Statut invalide'));
  });

  // TEST-TENANT-06 — Tenant inexistant
  it('TEST-TENANT-06: lève NotFoundException "Tenant introuvable"', async () => {
    mockRepo.updateStatut.mockResolvedValue(null);

    await expect(
      useCase.execute('uuid-inexistant', 'ACTIF'),
    ).rejects.toThrow(new NotFoundException('Tenant introuvable'));
  });
});
