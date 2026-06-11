import { NotFoundException } from '@nestjs/common';
import { ModifierLogementUseCase } from './modifier-logement.use-case';
import { ILogementRepository, StatutLogement } from '../../domain/ports/logement.repository.port';

describe('ModifierLogementUseCase', () => {
  let useCase: ModifierLogementUseCase;
  let mockRepo: jest.Mocked<ILogementRepository>;

  const base = {
    id: 'logement-uuid-A',
    tenantId: 'tenant-A',
    nom: 'Gîte Original',
    capacite: 4,
    statut: StatutLogement.ACTIF,
    updatedAt: new Date(),
  };

  beforeEach(() => {
    mockRepo = {
      findAll: jest.fn(),
      findById: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      hasReservationsFutures: jest.fn(),
      findAllWithoutTenantFilter: jest.fn(),
    };
    useCase = new ModifierLogementUseCase(mockRepo);
  });

  afterEach(() => jest.clearAllMocks());

  // TEST-LOGEMENT-04 — Modification réussie
  it('TEST-LOGEMENT-04: retourne logement mis à jour avec updatedAt rafraîchi', async () => {
    const updated = { ...base, nom: 'Nouveau Nom', updatedAt: new Date() };
    mockRepo.update.mockResolvedValue(updated);

    const result = await useCase.execute({
      id: 'logement-uuid-A',
      tenantId: 'tenant-A',
      data: { nom: 'Nouveau Nom' },
    });

    expect(result.nom).toBe('Nouveau Nom');
    expect(result.updatedAt).toBeDefined();
  });

  // TEST-LOGEMENT-05 — Logement autre tenant → 404 (ne pas révéler l'existence)
  it('TEST-LOGEMENT-05: retourne 404 quand logement appartient à un autre tenant', async () => {
    mockRepo.update.mockResolvedValue(null);

    await expect(
      useCase.execute({ id: 'logement-uuid-A', tenantId: 'tenant-B', data: { nom: 'Hack' } }),
    ).rejects.toThrow(NotFoundException);
  });

  // TEST-LOGEMENT-06 — Logement inexistant
  it('TEST-LOGEMENT-06: retourne 404 quand logement inexistant', async () => {
    mockRepo.update.mockResolvedValue(null);

    await expect(
      useCase.execute({ id: 'uuid-inexistant', tenantId: 'tenant-A', data: {} }),
    ).rejects.toThrow(NotFoundException);
  });
});
