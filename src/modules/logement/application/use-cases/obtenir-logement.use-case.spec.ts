import { NotFoundException } from '@nestjs/common';
import { ObtenirLogementUseCase } from './obtenir-logement.use-case';
import { ILogementRepository, StatutLogement } from '../../domain/ports/logement.repository.port';

describe('ObtenirLogementUseCase', () => {
  let useCase: ObtenirLogementUseCase;
  let mockRepo: jest.Mocked<ILogementRepository>;

  const logementComplet = {
    id: 'logement-uuid-001',
    tenantId: 'tenant-A',
    nom: 'Gîte Les Lavandes',
    capacite: 6,
    statut: StatutLogement.ACTIF,
    photos: [],
    tarifBase: { id: 'tarif-uuid', logementId: 'logement-uuid-001', prixParNuit: 120 },
    configAcompte: { id: 'ca-uuid', logementId: 'logement-uuid-001', actif: false, pourcentage: 30, delaiSoldeJours: 30 },
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
    useCase = new ObtenirLogementUseCase(mockRepo);
  });

  afterEach(() => jest.clearAllMocks());

  // TEST-LOGEMENT-09 — Consultation réussie
  it('TEST-LOGEMENT-09: retourne logement complet avec photos, tarifs et configAcompte', async () => {
    mockRepo.findById.mockResolvedValue(logementComplet);

    const result = await useCase.execute('logement-uuid-001', 'tenant-A');

    expect(result.nom).toBe('Gîte Les Lavandes');
    expect(result.tarifBase).toBeDefined();
    expect(result.configAcompte).toBeDefined();
  });

  // TEST-LOGEMENT-10 — Logement inexistant
  it('TEST-LOGEMENT-10: lève NotFoundException "Logement introuvable"', async () => {
    mockRepo.findById.mockResolvedValue(null);

    await expect(useCase.execute('uuid-inexistant', 'tenant-A')).rejects.toThrow(
      new NotFoundException('Logement introuvable'),
    );
  });

  // TEST-LOGEMENT-11 — Isolation multi-tenant (404 depuis autre tenant)
  it('TEST-LOGEMENT-11: retourne 404 quand logement appartient à un autre tenant', async () => {
    mockRepo.findById.mockResolvedValue(null); // le repo filtre par tenantId

    await expect(useCase.execute('logement-uuid-001', 'tenant-B')).rejects.toThrow(
      NotFoundException,
    );
  });
});
