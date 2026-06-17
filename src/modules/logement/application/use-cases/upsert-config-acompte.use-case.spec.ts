import { BadRequestException } from '@nestjs/common';
import { UpsertConfigAcompteUseCase } from './upsert-config-acompte.use-case';
import { IConfigAcompteRepository } from '../../domain/ports/config-acompte.repository.port';

describe('UpsertConfigAcompteUseCase', () => {
  let useCase: UpsertConfigAcompteUseCase;
  let mockRepo: jest.Mocked<IConfigAcompteRepository>;

  beforeEach(() => {
    mockRepo = { findByLogement: jest.fn(), upsert: jest.fn() };
    useCase = new UpsertConfigAcompteUseCase(mockRepo);
  });

  afterEach(() => jest.clearAllMocks());

  // TEST-ACOMPTE-01 — Activation
  it('TEST-ACOMPTE-01: crée config acompte actif=true, 30%, 30 jours', async () => {
    mockRepo.upsert.mockResolvedValue({
      id: 'ca-uuid',
      logementId: 'log-uuid',
      actif: true,
      pourcentage: 30,
      delaiSoldeJours: 30,
    });

    const result = await useCase.execute({
      logementId: 'log-uuid',
      tenantId: 'tenant-A',
      actif: true,
      pourcentage: 30,
      delaiSoldeJours: 30,
    });

    expect(result.actif).toBe(true);
    expect(result.pourcentage).toBe(30);
  });

  // TEST-ACOMPTE-02 — Désactivation
  it('TEST-ACOMPTE-02: désactive acompte (actif=false)', async () => {
    mockRepo.upsert.mockResolvedValue({
      id: 'ca-uuid',
      logementId: 'log-uuid',
      actif: false,
      pourcentage: 30,
      delaiSoldeJours: 30,
    });

    const result = await useCase.execute({
      logementId: 'log-uuid',
      tenantId: 'tenant-A',
      actif: false,
    });

    expect(result.actif).toBe(false);
  });

  // TEST-ACOMPTE-03 — Pourcentage invalide
  it('TEST-ACOMPTE-03: lève BadRequestException "Le pourcentage doit être compris entre 1 et 99"', async () => {
    await expect(
      useCase.execute({
        logementId: 'log-uuid',
        tenantId: 'tenant-A',
        actif: true,
        pourcentage: 150,
      }),
    ).rejects.toThrow(
      new BadRequestException('Le pourcentage doit être compris entre 1 et 99'),
    );
  });
});
