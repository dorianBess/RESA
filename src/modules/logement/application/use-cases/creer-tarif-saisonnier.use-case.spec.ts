import { BadRequestException } from '@nestjs/common';
import { CreerTarifSaisonnierUseCase } from './creer-tarif-saisonnier.use-case';
import { ITarifRepository } from '../../domain/ports/tarif.repository.port';

describe('CreerTarifSaisonnierUseCase', () => {
  let useCase: CreerTarifSaisonnierUseCase;
  let mockRepo: jest.Mocked<ITarifRepository>;

  beforeEach(() => {
    mockRepo = {
      findBase: jest.fn(), upsertBase: jest.fn(), findSaisonniers: jest.fn(),
      createSaisonnier: jest.fn(), updateSaisonnier: jest.fn(), deleteSaisonnier: jest.fn(),
      findApplicable: jest.fn(),
    };
    useCase = new CreerTarifSaisonnierUseCase(mockRepo);
  });

  afterEach(() => jest.clearAllMocks());

  // TEST-TARIF-04 — Création tarif saisonnier réussie
  it('TEST-TARIF-04: crée tarif saisonnier juillet-août 2025 à 180€/nuit', async () => {
    const tarif = {
      id: 'ts-uuid', logementId: 'log-uuid', nom: 'Été 2025',
      dateDebut: new Date('2025-07-01'), dateFin: new Date('2025-08-31'),
      prixParNuit: 180, priorite: 1,
    };
    mockRepo.createSaisonnier.mockResolvedValue(tarif);

    const result = await useCase.execute({
      logementId: 'log-uuid', tenantId: 'tenant-A',
      dateDebut: new Date('2025-07-01'), dateFin: new Date('2025-08-31'),
      prixParNuit: 180,
    });

    expect(result.prixParNuit).toBe(180);
    expect(mockRepo.createSaisonnier).toHaveBeenCalled();
  });

  // TEST-TARIF-05 — Dates invalides (fin avant début)
  it('TEST-TARIF-05: lève BadRequestException "La date de fin doit être postérieure"', async () => {
    await expect(
      useCase.execute({
        logementId: 'log-uuid', tenantId: 'tenant-A',
        dateDebut: new Date('2025-08-01'), dateFin: new Date('2025-07-01'),
        prixParNuit: 180,
      }),
    ).rejects.toThrow(
      new BadRequestException('La date de fin doit être postérieure à la date de début'),
    );
  });
});
