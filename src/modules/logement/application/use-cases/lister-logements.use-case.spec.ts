import { ListerLogementsUseCase } from './lister-logements.use-case';
import {
  ILogementRepository,
  StatutLogement,
} from '../../domain/ports/logement.repository.port';

describe('ListerLogementsUseCase', () => {
  let useCase: ListerLogementsUseCase;
  let mockRepo: jest.Mocked<ILogementRepository>;

  const logements = [
    {
      id: 'log-1',
      tenantId: 'tenant-A',
      nom: 'Gîte des Pins',
      capacite: 4,
      statut: StatutLogement.ACTIF,
    },
    {
      id: 'log-2',
      tenantId: 'tenant-A',
      nom: 'Chalet du Lac',
      capacite: 6,
      statut: StatutLogement.ACTIF,
    },
  ];

  beforeEach(() => {
    mockRepo = {
      findAll: jest.fn(),
      findById: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      hasReservationsFutures: jest.fn(),
      findAllWithoutTenantFilter: jest.fn(),
    };
    useCase = new ListerLogementsUseCase(mockRepo);
  });

  afterEach(() => jest.clearAllMocks());

  // TEST-LOG-LIST-01 — Liste tous les logements du tenant
  it('TEST-LOG-LIST-01: retourne la liste paginée des logements', async () => {
    mockRepo.findAll.mockResolvedValue({ data: logements, total: 2 });

    const result = await useCase.execute('tenant-A');

    expect(result.data).toHaveLength(2);
    expect(result.total).toBe(2);
    expect(mockRepo.findAll).toHaveBeenCalledWith('tenant-A', undefined);
  });

  // TEST-LOG-LIST-02 — Avec options de pagination
  it('TEST-LOG-LIST-02: transmet les options de pagination au repository', async () => {
    mockRepo.findAll.mockResolvedValue({ data: [logements[0]], total: 1 });

    await useCase.execute('tenant-A', { statut: 'ACTIF', page: 1, limit: 10 });

    expect(mockRepo.findAll).toHaveBeenCalledWith('tenant-A', {
      statut: 'ACTIF',
      page: 1,
      limit: 10,
    });
  });

  // TEST-LOG-LIST-03 — Aucun logement
  it('TEST-LOG-LIST-03: retourne liste vide si aucun logement', async () => {
    mockRepo.findAll.mockResolvedValue({ data: [], total: 0 });

    const result = await useCase.execute('tenant-B');

    expect(result.data).toHaveLength(0);
    expect(result.total).toBe(0);
  });
});
