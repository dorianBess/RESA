import { BadRequestException } from '@nestjs/common';
import { VerifierDisponibiliteUseCase } from './verifier-disponibilite.use-case';
import { IReservationRepository } from '../../domain/ports/reservation.repository.port';

// Mock du port sortant — aucune base de données requise
const mockRepository: jest.Mocked<IReservationRepository> = {
  findById: jest.fn(),
  findByLogement: jest.fn(),
  existsConflict: jest.fn(),
  save: jest.fn(),
  updateStatut: jest.fn(),
  createHold: jest.fn(),
  deleteExpiredHolds: jest.fn(),
  existsActiveHold: jest.fn(),
};

describe('VerifierDisponibiliteUseCase', () => {
  let useCase: VerifierDisponibiliteUseCase;

  beforeEach(() => {
    useCase = new VerifierDisponibiliteUseCase(mockRepository);
    jest.clearAllMocks();
  });

  const baseCommand = {
    logementId: 'logement-uuid',
    tenantId: 'tenant-uuid',
    dateDebut: new Date('2026-07-01'),
    dateFin: new Date('2026-07-05'),
  };

  describe('Cas nominal', () => {
    it('retourne disponible=true quand aucun conflit ni hold', async () => {
      mockRepository.existsConflict.mockResolvedValue(false);
      mockRepository.existsActiveHold.mockResolvedValue(false);

      const result = await useCase.execute(baseCommand);

      expect(result.disponible).toBe(true);
      expect(result.motif).toBeUndefined();
    });
  });

  describe('Cas alternatifs', () => {
    it('retourne disponible=false quand conflit de réservation', async () => {
      mockRepository.existsConflict.mockResolvedValue(true);

      const result = await useCase.execute(baseCommand);

      expect(result.disponible).toBe(false);
      expect(result.motif).toContain('déjà réservées');
    });

    it('retourne disponible=false quand hold actif', async () => {
      mockRepository.existsConflict.mockResolvedValue(false);
      mockRepository.existsActiveHold.mockResolvedValue(true);

      const result = await useCase.execute(baseCommand);

      expect(result.disponible).toBe(false);
      expect(result.motif).toContain('temporairement');
    });
  });

  describe("Cas d'erreur", () => {
    it('lève BadRequestException si dateFin <= dateDebut', async () => {
      await expect(
        useCase.execute({
          ...baseCommand,
          dateDebut: new Date('2026-07-05'),
          dateFin: new Date('2026-07-01'),
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('lève BadRequestException si durée < 1 nuit', async () => {
      const sameDay = new Date('2026-07-01');
      await expect(
        useCase.execute({
          ...baseCommand,
          dateDebut: sameDay,
          dateFin: sameDay,
        }),
      ).rejects.toThrow(BadRequestException);
    });
  });
});
