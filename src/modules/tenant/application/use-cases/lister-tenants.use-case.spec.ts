import { ListerTenantsUseCase } from './lister-tenants.use-case';
import { ITenantRepository, TenantDomain } from '../../domain/ports/tenant.repository.port';

describe('ListerTenantsUseCase', () => {
  let useCase: ListerTenantsUseCase;
  let mockRepo: jest.Mocked<ITenantRepository>;

  const tenants: TenantDomain[] = [
    {
      id: 'tenant-1', raisonSociale: 'Gîte des Alpes', email: 'alpes@gites.fr',
      abonnementStatut: 'ACTIF', abonnementDebut: null, abonnementFin: null,
    },
    {
      id: 'tenant-2', raisonSociale: 'Mas Provençal', email: 'mas@provence.fr',
      abonnementStatut: 'ESSAI', abonnementDebut: null, abonnementFin: null,
    },
  ];

  beforeEach(() => {
    mockRepo = {
      findAll: jest.fn(),
      findById: jest.fn(),
      emailExists: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      updateStatut: jest.fn(),
    };
    useCase = new ListerTenantsUseCase(mockRepo);
  });

  afterEach(() => jest.clearAllMocks());

  // TEST-TENANT-LIST-01 — Liste tous les tenants
  it('TEST-TENANT-LIST-01: retourne la liste de tous les tenants', async () => {
    mockRepo.findAll.mockResolvedValue(tenants);

    const result = await useCase.execute();

    expect(result).toHaveLength(2);
    expect(result[0].raisonSociale).toBe('Gîte des Alpes');
    expect(mockRepo.findAll).toHaveBeenCalledTimes(1);
  });

  // TEST-TENANT-LIST-02 — Liste vide
  it('TEST-TENANT-LIST-02: retourne une liste vide s\'il n\'y a aucun tenant', async () => {
    mockRepo.findAll.mockResolvedValue([]);

    const result = await useCase.execute();

    expect(result).toHaveLength(0);
  });
});
