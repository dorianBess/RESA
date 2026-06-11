import { RegenerarTokenWidgetUseCase } from './regenerer-token-widget.use-case';
import { IWidgetRepository } from '../../domain/ports/widget.repository.port';

describe('RegenerarTokenWidgetUseCase', () => {
  let useCase: RegenerarTokenWidgetUseCase;
  let mockRepo: jest.Mocked<IWidgetRepository>;

  beforeEach(() => {
    mockRepo = {
      findByTenantId: jest.fn(), upsert: jest.fn(), regenererToken: jest.fn(),
    };
    useCase = new RegenerarTokenWidgetUseCase(mockRepo);
  });

  afterEach(() => jest.clearAllMocks());

  // TEST-WIDGET-04 — Régénération token
  it('TEST-WIDGET-04: nouveau tokenPublic différent de l\'ancien + codeHtml mis à jour', async () => {
    const nouveauToken = 'tok_newXYZ';
    mockRepo.regenererToken.mockResolvedValue({
      tenantId: 'tenant-A',
      tokenPublic: nouveauToken,
      config: { couleurPrimaire: '#3B82F6', couleurSecondaire: '#1E3A5F', couleurTexte: '#FFF', police: 'Inter', borderRadius: 8 },
      codeHtml: `<script src="https://api.resa.fr/widget.js" data-token="${nouveauToken}"></script>`,
    });

    const result = await useCase.execute('tenant-A');

    expect(result.tokenPublic).toBe(nouveauToken);
    expect(result.codeHtml).toContain(nouveauToken);
    expect(mockRepo.regenererToken).toHaveBeenCalledWith('tenant-A');
  });
});
