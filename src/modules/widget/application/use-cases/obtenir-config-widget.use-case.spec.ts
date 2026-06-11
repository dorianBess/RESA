import { ObtenirConfigWidgetUseCase } from './obtenir-config-widget.use-case';
import { IWidgetRepository } from '../../domain/ports/widget.repository.port';

describe('ObtenirConfigWidgetUseCase', () => {
  let useCase: ObtenirConfigWidgetUseCase;
  let mockRepo: jest.Mocked<IWidgetRepository>;

  const configExistante = {
    tenantId: 'tenant-A',
    tokenPublic: 'tok_abc123',
    config: {
      couleurPrimaire: '#3B82F6', couleurSecondaire: '#1E3A5F',
      couleurTexte: '#FFFFFF', police: 'Inter', borderRadius: 8,
    },
    codeHtml: '<script src="https://api.resa.fr/widget.js" data-token="tok_abc123"></script>',
  };

  beforeEach(() => {
    mockRepo = {
      findByTenantId: jest.fn(), upsert: jest.fn(), regenererToken: jest.fn(),
    };
    useCase = new ObtenirConfigWidgetUseCase(mockRepo);
  });

  afterEach(() => jest.clearAllMocks());

  // TEST-WIDGET-01 — Récupération config
  it('TEST-WIDGET-01: retourne tokenPublic + codeHtml avec script d\'intégration', async () => {
    mockRepo.findByTenantId.mockResolvedValue(configExistante);

    const result = await useCase.execute('tenant-A');

    expect(result.tokenPublic).toBe('tok_abc123');
    expect(result.codeHtml).toContain('tok_abc123');
  });
});
