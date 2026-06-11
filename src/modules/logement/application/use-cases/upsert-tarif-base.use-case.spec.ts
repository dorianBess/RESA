import { BadRequestException } from '@nestjs/common';
import { UpsertTarifBaseUseCase } from './upsert-tarif-base.use-case';
import { ITarifRepository } from '../../domain/ports/tarif.repository.port';

describe('UpsertTarifBaseUseCase', () => {
  let useCase: UpsertTarifBaseUseCase;
  let mockRepo: jest.Mocked<ITarifRepository>;

  beforeEach(() => {
    mockRepo = {
      findBase: jest.fn(), upsertBase: jest.fn(), findSaisonniers: jest.fn(),
      createSaisonnier: jest.fn(), updateSaisonnier: jest.fn(), deleteSaisonnier: jest.fn(),
      findApplicable: jest.fn(),
    };
    useCase = new UpsertTarifBaseUseCase(mockRepo);
  });

  afterEach(() => jest.clearAllMocks());

  // TEST-TARIF-01 — Création tarif de base
  it('TEST-TARIF-01: crée tarif de base avec prixParNuit 120 et prixSemaine 750', async () => {
    const tarif = { id: 'tarif-uuid', logementId: 'log-uuid', prixParNuit: 120, prixSemaine: 750 };
    mockRepo.upsertBase.mockResolvedValue(tarif);

    const result = await useCase.execute({
      logementId: 'log-uuid', tenantId: 'tenant-A', prixParNuit: 120, prixSemaine: 750,
    });

    expect(result.prixParNuit).toBe(120);
    expect(mockRepo.upsertBase).toHaveBeenCalled();
  });

  // TEST-TARIF-02 — Mise à jour tarif existant (upsert)
  it('TEST-TARIF-02: upsert crée un seul enregistrement même si tarif existait', async () => {
    const tarif = { id: 'tarif-uuid', logementId: 'log-uuid', prixParNuit: 120 };
    mockRepo.upsertBase.mockResolvedValue(tarif);

    await useCase.execute({ logementId: 'log-uuid', tenantId: 'tenant-A', prixParNuit: 120 });

    expect(mockRepo.upsertBase).toHaveBeenCalledTimes(1);
  });

  // TEST-TARIF-03 — Prix négatif
  it('TEST-TARIF-03: lève BadRequestException "Le prix doit être supérieur à 0"', async () => {
    await expect(
      useCase.execute({ logementId: 'log-uuid', tenantId: 'tenant-A', prixParNuit: -50 }),
    ).rejects.toThrow(new BadRequestException('Le prix doit être supérieur à 0'));
  });
});
