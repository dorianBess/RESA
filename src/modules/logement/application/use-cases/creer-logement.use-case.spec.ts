import { BadRequestException } from '@nestjs/common';
import { CreerLogementUseCase } from './creer-logement.use-case';
import {
  ILogementRepository,
  StatutLogement,
} from '../../domain/ports/logement.repository.port';

describe('CreerLogementUseCase', () => {
  let useCase: CreerLogementUseCase;
  let mockRepo: jest.Mocked<ILogementRepository>;

  const logementCree = {
    id: 'logement-uuid-001',
    tenantId: 'tenant-uuid-001',
    nom: 'Gîte Les Lavandes',
    capacite: 6,
    statut: StatutLogement.ACTIF,
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
    useCase = new CreerLogementUseCase(mockRepo);
  });

  afterEach(() => jest.clearAllMocks());

  // TEST-LOGEMENT-01 — Création réussie
  it('TEST-LOGEMENT-01: crée logement statut ACTIF avec tenant_id du gestionnaire', async () => {
    mockRepo.create.mockResolvedValue(logementCree);

    const result = await useCase.execute({
      tenantId: 'tenant-uuid-001',
      nom: 'Gîte Les Lavandes',
      capacite: 6,
    });

    expect(result.statut).toBe(StatutLogement.ACTIF);
    expect(result.tenantId).toBe('tenant-uuid-001');
    expect(mockRepo.create).toHaveBeenCalledWith(
      expect.objectContaining({
        nom: 'Gîte Les Lavandes',
        statut: StatutLogement.ACTIF,
      }),
    );
  });

  // TEST-LOGEMENT-02 — Capacité négative
  it('TEST-LOGEMENT-02: lève BadRequestException "La capacité doit être supérieure à 0"', async () => {
    await expect(
      useCase.execute({ tenantId: 'tenant-uuid', nom: 'Test', capacite: -1 }),
    ).rejects.toThrow(
      new BadRequestException('La capacité doit être supérieure à 0'),
    );
  });

  // TEST-LOGEMENT-03 — Nom manquant
  it('TEST-LOGEMENT-03: lève BadRequestException "Le champ nom est obligatoire"', async () => {
    await expect(
      useCase.execute({ tenantId: 'tenant-uuid', nom: '', capacite: 4 }),
    ).rejects.toThrow(new BadRequestException('Le champ nom est obligatoire'));
  });
});
