import { BadRequestException, ConflictException } from '@nestjs/common';
import { VerifierDisponibiliteCompletUseCase } from './verifier-disponibilite-complet.use-case';
import {
  ILogementRepository,
  StatutLogement,
} from '../../domain/ports/logement.repository.port';
import { IBlocageRepository } from '../../domain/ports/blocage.repository.port';
import { IDisponibiliteRepository } from '../../domain/ports/disponibilite.repository.port';
import { ITarifRepository } from '../../domain/ports/tarif.repository.port';
import { IConfigAcompteRepository } from '../../domain/ports/config-acompte.repository.port';

describe('VerifierDisponibiliteCompletUseCase', () => {
  let useCase: VerifierDisponibiliteCompletUseCase;
  let mockLogement: jest.Mocked<ILogementRepository>;
  let mockBlocage: jest.Mocked<IBlocageRepository>;
  let mockDispo: jest.Mocked<IDisponibiliteRepository>;
  let mockTarif: jest.Mocked<ITarifRepository>;
  let mockAcompte: jest.Mocked<IConfigAcompteRepository>;

  const logement = {
    id: 'log-uuid',
    tenantId: 'tenant-A',
    nom: 'Gîte',
    capacite: 4,
    statut: StatutLogement.ACTIF,
  };

  const baseCmd = {
    logementId: 'log-uuid',
    tenantId: 'tenant-A',
    dateDebut: new Date('2025-07-10'),
    dateFin: new Date('2025-07-17'),
    nbPersonnes: 4,
  };

  beforeEach(() => {
    mockLogement = {
      findAll: jest.fn(),
      findById: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      hasReservationsFutures: jest.fn(),
      findAllWithoutTenantFilter: jest.fn(),
    };
    mockBlocage = {
      findByLogement: jest.fn(),
      findById: jest.fn(),
      existsConflictWithReservation: jest.fn(),
      existsConflict: jest.fn(),
      create: jest.fn(),
      delete: jest.fn(),
      findByDateRange: jest.fn(),
    };
    mockDispo = { existsConflict: jest.fn(), existsActiveHold: jest.fn() };
    mockTarif = {
      findBase: jest.fn(),
      upsertBase: jest.fn(),
      findSaisonniers: jest.fn(),
      createSaisonnier: jest.fn(),
      updateSaisonnier: jest.fn(),
      deleteSaisonnier: jest.fn(),
      findApplicable: jest.fn(),
    };
    mockAcompte = { findByLogement: jest.fn(), upsert: jest.fn() };
    useCase = new VerifierDisponibiliteCompletUseCase(
      mockLogement,
      mockBlocage,
      mockDispo,
      mockTarif,
      mockAcompte,
    );
  });

  afterEach(() => jest.clearAllMocks());

  function setupDisponible(
    prixParNuit = 120,
    acompte: { actif: boolean; pourcentage?: number } = { actif: false },
  ) {
    mockLogement.findById.mockResolvedValue(logement);
    mockDispo.existsConflict.mockResolvedValue(false);
    mockBlocage.existsConflict.mockResolvedValue(false);
    mockTarif.findApplicable.mockResolvedValue(null);
    mockTarif.findBase.mockResolvedValue({
      id: 't',
      logementId: 'log-uuid',
      prixParNuit,
    });
    mockAcompte.findByLogement.mockResolvedValue(
      acompte.actif
        ? {
            id: 'ca',
            logementId: 'log-uuid',
            actif: true,
            pourcentage: acompte.pourcentage ?? 30,
            delaiSoldeJours: 30,
          }
        : null,
    );
  }

  // TEST-DISPO-01 — Logement disponible
  it('TEST-DISPO-01: retourne disponible=true, nbNuits=7, montantTotal=840', async () => {
    setupDisponible(120);

    const result = await useCase.execute(baseCmd);

    expect(result.disponible).toBe(true);
    expect(result.nbNuits).toBe(7);
    expect(result.montantTotal).toBe(840);
  });

  // TEST-DISPO-02 — Non disponible (réservation existante)
  it('TEST-DISPO-02: lève ConflictException quand réservation CONFIRMEE sur ces dates', async () => {
    mockLogement.findById.mockResolvedValue(logement);
    mockDispo.existsConflict.mockResolvedValue(true);

    await expect(useCase.execute(baseCmd)).rejects.toThrow(ConflictException);
  });

  // TEST-DISPO-03 — Non disponible (blocage iCal)
  it('TEST-DISPO-03: lève ConflictException quand blocage AIRBNB sur ces dates', async () => {
    mockLogement.findById.mockResolvedValue(logement);
    mockDispo.existsConflict.mockResolvedValue(false);
    mockBlocage.existsConflict.mockResolvedValue(true);

    await expect(useCase.execute(baseCmd)).rejects.toThrow(ConflictException);
  });

  // TEST-DISPO-04 — Capacité insuffisante
  it('TEST-DISPO-04: lève ConflictException "Capacité insuffisante pour 6 personnes"', async () => {
    mockLogement.findById.mockResolvedValue(logement); // capacite=4

    await expect(
      useCase.execute({ ...baseCmd, nbPersonnes: 6 }),
    ).rejects.toThrow(
      new ConflictException('Capacité insuffisante pour 6 personnes'),
    );
  });

  // TEST-DISPO-05 — Tarif saisonnier appliqué (180€/nuit)
  it('TEST-DISPO-05: applique tarif saisonnier 180€/nuit → montantTotal=1260', async () => {
    mockLogement.findById.mockResolvedValue(logement);
    mockDispo.existsConflict.mockResolvedValue(false);
    mockBlocage.existsConflict.mockResolvedValue(false);
    mockTarif.findApplicable.mockResolvedValue({
      id: 'ts',
      logementId: 'log-uuid',
      nom: 'Été',
      prixParNuit: 180,
      dateDebut: new Date('2025-07-01'),
      dateFin: new Date('2025-08-31'),
      priorite: 2,
    });
    mockTarif.findBase.mockResolvedValue({
      id: 't',
      logementId: 'log-uuid',
      prixParNuit: 120,
    });
    mockAcompte.findByLogement.mockResolvedValue(null);

    const result = await useCase.execute(baseCmd);

    expect(result.montantTotal).toBe(1260); // 7 × 180
  });

  // TEST-DISPO-06 — Dates invalides
  it('TEST-DISPO-06: lève BadRequestException quand dateFin avant dateDebut', async () => {
    await expect(
      useCase.execute({
        ...baseCmd,
        dateDebut: new Date('2025-07-17'),
        dateFin: new Date('2025-07-10'),
      }),
    ).rejects.toThrow(
      new BadRequestException(
        'La date de fin doit être postérieure à la date de début',
      ),
    );
  });

  // TEST-DISPO-07 — Logement introuvable
  it('TEST-DISPO-07: lève ConflictException "Logement introuvable"', async () => {
    mockLogement.findById.mockResolvedValue(null);

    await expect(useCase.execute(baseCmd)).rejects.toThrow(
      new ConflictException('Logement introuvable'),
    );
  });

  // TEST-DISPO-08 — Aucun tarif configuré → prix 0
  it('TEST-DISPO-08: retourne montantTotal=0 si aucun tarif base ni saisonnier', async () => {
    mockLogement.findById.mockResolvedValue(logement);
    mockDispo.existsConflict.mockResolvedValue(false);
    mockBlocage.existsConflict.mockResolvedValue(false);
    mockTarif.findApplicable.mockResolvedValue(null);
    mockTarif.findBase.mockResolvedValue(null);
    mockAcompte.findByLogement.mockResolvedValue(null);

    const result = await useCase.execute(baseCmd);

    expect(result.montantTotal).toBe(0);
    expect(result.disponible).toBe(true);
  });

  // TEST-DISPO-09 — Acompte actif
  it('TEST-DISPO-09: calcule montantAcompte quand acompte actif à 30%', async () => {
    setupDisponible(120, { actif: true, pourcentage: 30 });

    const result = await useCase.execute(baseCmd);

    expect(result.acompteActif).toBe(true);
    expect(result.montantAcompte).toBe(252); // 840 * 30 / 100
  });
});
