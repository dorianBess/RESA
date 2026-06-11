import { NotFoundException } from '@nestjs/common';
import { SupprimerTarifSaisonnierUseCase } from './supprimer-tarif-saisonnier.use-case';
import { ITarifRepository } from '../../domain/ports/tarif.repository.port';

describe('SupprimerTarifSaisonnierUseCase', () => {
  let useCase: SupprimerTarifSaisonnierUseCase;
  let mockRepo: jest.Mocked<ITarifRepository>;

  beforeEach(() => {
    mockRepo = {
      findBase: jest.fn(), upsertBase: jest.fn(), findSaisonniers: jest.fn(),
      createSaisonnier: jest.fn(), updateSaisonnier: jest.fn(), deleteSaisonnier: jest.fn(),
      findApplicable: jest.fn(),
    };
    useCase = new SupprimerTarifSaisonnierUseCase(mockRepo);
  });

  afterEach(() => jest.clearAllMocks());

  // TEST-TARIF-SUP-01 — Suppression réussie
  it('TEST-TARIF-SUP-01: supprime le tarif saisonnier existant', async () => {
    mockRepo.deleteSaisonnier.mockResolvedValue(true);

    await expect(useCase.execute('ts-uuid', 'tenant-A')).resolves.toBeUndefined();
    expect(mockRepo.deleteSaisonnier).toHaveBeenCalledWith('ts-uuid', 'tenant-A');
  });

  // TEST-TARIF-SUP-02 — Tarif introuvable
  it('TEST-TARIF-SUP-02: lève NotFoundException "Tarif saisonnier introuvable"', async () => {
    mockRepo.deleteSaisonnier.mockResolvedValue(false);

    await expect(
      useCase.execute('uuid-inexistant', 'tenant-A'),
    ).rejects.toThrow(new NotFoundException('Tarif saisonnier introuvable'));
  });
});
