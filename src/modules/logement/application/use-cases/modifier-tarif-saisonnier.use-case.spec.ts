import { NotFoundException } from '@nestjs/common';
import { ModifierTarifSaisonnierUseCase } from './modifier-tarif-saisonnier.use-case';
import { ITarifRepository } from '../../domain/ports/tarif.repository.port';

describe('ModifierTarifSaisonnierUseCase', () => {
  let useCase: ModifierTarifSaisonnierUseCase;
  let mockRepo: jest.Mocked<ITarifRepository>;

  const tarifExistant = {
    id: 'ts-uuid',
    logementId: 'log-uuid',
    nom: 'Été 2025',
    dateDebut: new Date('2025-07-01'),
    dateFin: new Date('2025-08-31'),
    prixParNuit: 180,
    priorite: 1,
  };

  beforeEach(() => {
    mockRepo = {
      findBase: jest.fn(),
      upsertBase: jest.fn(),
      findSaisonniers: jest.fn(),
      createSaisonnier: jest.fn(),
      updateSaisonnier: jest.fn(),
      deleteSaisonnier: jest.fn(),
      findApplicable: jest.fn(),
    };
    useCase = new ModifierTarifSaisonnierUseCase(mockRepo);
  });

  afterEach(() => jest.clearAllMocks());

  // TEST-TARIF-MOD-01 — Modification réussie
  it('TEST-TARIF-MOD-01: modifie le prix du tarif saisonnier', async () => {
    const tarifMis = { ...tarifExistant, prixParNuit: 200 };
    mockRepo.updateSaisonnier.mockResolvedValue(tarifMis);

    const result = await useCase.execute('ts-uuid', 'tenant-A', {
      prixParNuit: 200,
    });

    expect(result.prixParNuit).toBe(200);
    expect(mockRepo.updateSaisonnier).toHaveBeenCalledWith(
      'ts-uuid',
      'tenant-A',
      { prixParNuit: 200 },
    );
  });

  // TEST-TARIF-MOD-02 — Tarif introuvable
  it('TEST-TARIF-MOD-02: lève NotFoundException "Tarif saisonnier introuvable"', async () => {
    mockRepo.updateSaisonnier.mockResolvedValue(null);

    await expect(
      useCase.execute('uuid-inexistant', 'tenant-A', { prixParNuit: 200 }),
    ).rejects.toThrow(new NotFoundException('Tarif saisonnier introuvable'));
  });

  // TEST-TARIF-MOD-03 — Modification du nom
  it('TEST-TARIF-MOD-03: modifie le nom du tarif saisonnier', async () => {
    const tarifMis = { ...tarifExistant, nom: 'Haute saison 2025' };
    mockRepo.updateSaisonnier.mockResolvedValue(tarifMis);

    const result = await useCase.execute('ts-uuid', 'tenant-A', {
      nom: 'Haute saison 2025',
    });

    expect(result.nom).toBe('Haute saison 2025');
  });
});
