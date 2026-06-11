import { CalculerPrixUseCase } from './calculer-prix.use-case';

describe('CalculerPrixUseCase', () => {
  let useCase: CalculerPrixUseCase;

  beforeEach(() => {
    useCase = new CalculerPrixUseCase();
  });

  // TEST-PRIX-01 — Calcul sans acompte
  it('TEST-PRIX-01: calcule 7 nuits à 120€ = 840€ sans acompte', () => {
    const result = useCase.execute(
      new Date('2025-07-10'),
      new Date('2025-07-17'),
      120,
      null,
    );

    expect(result.nbNuits).toBe(7);
    expect(result.montantTotal).toBe(840);
    expect(result.montantAcompte).toBeNull();
  });

  // TEST-PRIX-02 — Calcul avec acompte 30%
  it('TEST-PRIX-02: calcule acompte 30% sur 840€ = 252€', () => {
    const result = useCase.execute(
      new Date('2025-07-10'),
      new Date('2025-07-17'),
      120,
      { actif: true, pourcentage: 30 },
    );

    expect(result.nbNuits).toBe(7);
    expect(result.montantTotal).toBe(840);
    expect(result.montantAcompte).toBe(252);
  });

  // TEST-PRIX-03 — Acompte inactif → montantAcompte null
  it('TEST-PRIX-03: acompte inactif retourne montantAcompte null', () => {
    const result = useCase.execute(
      new Date('2025-07-10'),
      new Date('2025-07-17'),
      120,
      { actif: false, pourcentage: 30 },
    );

    expect(result.montantAcompte).toBeNull();
  });

  // TEST-PRIX-04 — Une seule nuit
  it('TEST-PRIX-04: calcule 1 nuit à 100€ = 100€', () => {
    const result = useCase.execute(
      new Date('2025-08-01'),
      new Date('2025-08-02'),
      100,
    );

    expect(result.nbNuits).toBe(1);
    expect(result.montantTotal).toBe(100);
    expect(result.montantAcompte).toBeNull();
  });

  // TEST-PRIX-05 — Sans config acompte (undefined)
  it('TEST-PRIX-05: sans config acompte retourne montantAcompte null', () => {
    const result = useCase.execute(
      new Date('2025-07-01'),
      new Date('2025-07-08'),
      150,
    );

    expect(result.montantAcompte).toBeNull();
  });
});
