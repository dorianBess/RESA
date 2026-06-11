import { BadRequestException } from '@nestjs/common';
import { ModifierConfigWidgetUseCase } from './modifier-config-widget.use-case';
import { IWidgetRepository } from '../../domain/ports/widget.repository.port';

describe('ModifierConfigWidgetUseCase', () => {
  let useCase: ModifierConfigWidgetUseCase;
  let mockRepo: jest.Mocked<IWidgetRepository>;

  const configBase = {
    tenantId: 'tenant-A', tokenPublic: 'tok_abc',
    config: {
      couleurPrimaire: '#3B82F6', couleurSecondaire: '#1E3A5F',
      couleurTexte: '#FFFFFF', police: 'Inter', borderRadius: 8,
    },
    codeHtml: '<script>...</script>',
  };

  beforeEach(() => {
    mockRepo = {
      findByTenantId: jest.fn(), upsert: jest.fn(), regenererToken: jest.fn(),
    };
    useCase = new ModifierConfigWidgetUseCase(mockRepo);
  });

  afterEach(() => jest.clearAllMocks());

  // TEST-WIDGET-02 — Mise à jour couleurs
  it('TEST-WIDGET-02: met à jour couleurPrimaire, autres champs inchangés', async () => {
    mockRepo.upsert.mockResolvedValue({
      ...configBase,
      config: { ...configBase.config, couleurPrimaire: '#FF5733' },
    });

    const result = await useCase.execute('tenant-A', { couleurPrimaire: '#FF5733' });

    expect(result.config.couleurPrimaire).toBe('#FF5733');
    expect(mockRepo.upsert).toHaveBeenCalledWith('tenant-A', { couleurPrimaire: '#FF5733' });
  });

  // TEST-WIDGET-03 — Couleur format invalide
  it('TEST-WIDGET-03: lève BadRequestException "Format de couleur invalide"', async () => {
    await expect(
      useCase.execute('tenant-A', { couleurPrimaire: 'rouge' }),
    ).rejects.toThrow(
      new BadRequestException('Format de couleur invalide. Format attendu : #RRGGBB'),
    );
  });
});
