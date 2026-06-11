import { BadRequestException } from '@nestjs/common';
import { ConfigurerIcalUseCase } from './configurer-ical.use-case';
import { IIcalRepository } from '../../domain/ports/ical.repository.port';

describe('ConfigurerIcalUseCase', () => {
  let useCase: ConfigurerIcalUseCase;
  let mockRepo: jest.Mocked<IIcalRepository>;

  beforeEach(() => {
    mockRepo = { saveUrls: jest.fn(), getUrls: jest.fn() };
    useCase = new ConfigurerIcalUseCase(mockRepo);
  });

  afterEach(() => jest.clearAllMocks());

  // TEST-ICAL-01 — Configuration URL iCal réussie
  it('TEST-ICAL-01: enregistre URL iCal Airbnb valide', async () => {
    mockRepo.saveUrls.mockResolvedValue();

    await expect(
      useCase.execute({
        logementId: 'log-uuid', tenantId: 'tenant-A',
        urlIcalAirbnb: 'https://airbnb.fr/ical/xxx.ics',
      }),
    ).resolves.toBeUndefined();

    expect(mockRepo.saveUrls).toHaveBeenCalledWith(
      'log-uuid', 'tenant-A',
      expect.objectContaining({ urlIcalAirbnb: 'https://airbnb.fr/ical/xxx.ics' }),
    );
  });

  // TEST-ICAL-02 — URL Airbnb invalide
  it("TEST-ICAL-02: lève BadRequestException \"Format d'URL invalide\"", async () => {
    await expect(
      useCase.execute({
        logementId: 'log-uuid', tenantId: 'tenant-A',
        urlIcalAirbnb: 'pas-une-url',
      }),
    ).rejects.toThrow(new BadRequestException("Format d'URL invalide"));
  });

  // TEST-ICAL-02B — URL Booking invalide
  it("TEST-ICAL-02B: lève BadRequestException pour URL Booking invalide", async () => {
    await expect(
      useCase.execute({
        logementId: 'log-uuid', tenantId: 'tenant-A',
        urlIcalBooking: 'pas-une-url',
      }),
    ).rejects.toThrow(new BadRequestException("Format d'URL invalide"));
  });

  // TEST-ICAL-01B — Configuration URL iCal Booking valide
  it('TEST-ICAL-01B: enregistre URL iCal Booking valide', async () => {
    mockRepo.saveUrls.mockResolvedValue();

    await expect(
      useCase.execute({
        logementId: 'log-uuid', tenantId: 'tenant-A',
        urlIcalBooking: 'https://booking.com/ical/xxx.ics',
      }),
    ).resolves.toBeUndefined();

    expect(mockRepo.saveUrls).toHaveBeenCalledWith(
      'log-uuid', 'tenant-A',
      expect.objectContaining({ urlIcalBooking: 'https://booking.com/ical/xxx.ics' }),
    );
  });
});
