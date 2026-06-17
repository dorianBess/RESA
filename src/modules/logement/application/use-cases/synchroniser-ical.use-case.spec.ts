import { SynchroniserIcalUseCase } from './synchroniser-ical.use-case';
import {
  IIcalRepository,
  IIcalFetcher,
  INotificationService,
} from '../../domain/ports/ical.repository.port';
import {
  IBlocageRepository,
  SourceBlocage,
} from '../../domain/ports/blocage.repository.port';
import { IDisponibiliteRepository } from '../../domain/ports/disponibilite.repository.port';

describe('SynchroniserIcalUseCase', () => {
  let useCase: SynchroniserIcalUseCase;
  let mockIcalRepo: jest.Mocked<IIcalRepository>;
  let mockFetcher: jest.Mocked<IIcalFetcher>;
  let mockBlocage: jest.Mocked<IBlocageRepository>;
  let mockDispo: jest.Mocked<IDisponibiliteRepository>;
  let mockNotif: jest.Mocked<INotificationService>;

  const event1 = {
    uid: 'e1',
    dateDebut: new Date('2025-07-10'),
    dateFin: new Date('2025-07-15'),
  };
  const event2 = {
    uid: 'e2',
    dateDebut: new Date('2025-08-01'),
    dateFin: new Date('2025-08-05'),
  };

  beforeEach(() => {
    mockIcalRepo = { saveUrls: jest.fn(), getUrls: jest.fn() };
    mockFetcher = { fetch: jest.fn() };
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
    mockNotif = { sendConflitIcalAlert: jest.fn() };
    useCase = new SynchroniserIcalUseCase(
      mockIcalRepo,
      mockFetcher,
      mockBlocage,
      mockDispo,
      mockNotif,
    );
  });

  afterEach(() => jest.clearAllMocks());

  // TEST-ICAL-03 — Synchronisation manuelle avec 2 événements
  it('TEST-ICAL-03: crée 2 blocages source AIRBNB depuis le fichier iCal', async () => {
    mockIcalRepo.getUrls.mockResolvedValue({
      urlIcalAirbnb: 'https://airbnb.fr/ical/xxx.ics',
    });
    mockFetcher.fetch.mockResolvedValue([event1, event2]);
    mockBlocage.findByDateRange.mockResolvedValue([]); // pas de doublon
    mockDispo.existsConflict.mockResolvedValue(false);
    mockBlocage.create.mockResolvedValue({
      id: 'b-uuid',
      logementId: 'log-uuid',
      tenantId: 'tenant-A',
      dateDebut: event1.dateDebut,
      dateFin: event1.dateFin,
      source: SourceBlocage.AIRBNB,
    });

    const result = await useCase.execute(
      'log-uuid',
      'tenant-A',
      'test@gite.fr',
      'Gîte',
    );

    expect(result.blocagesCrees).toBe(2);
    expect(mockBlocage.create).toHaveBeenCalledTimes(2);
  });

  // TEST-ICAL-04 — Détection conflit lors sync
  it('TEST-ICAL-04: crée blocage CONFLIT et envoie email si chevauchement avec réservation RESA', async () => {
    const conflictEvent = {
      uid: 'conflict',
      dateDebut: new Date('2025-07-17'),
      dateFin: new Date('2025-07-22'),
    };
    mockIcalRepo.getUrls.mockResolvedValue({
      urlIcalAirbnb: 'https://airbnb.fr/ical/xxx.ics',
    });
    mockFetcher.fetch.mockResolvedValue([conflictEvent]);
    mockBlocage.findByDateRange.mockResolvedValue([]);
    mockDispo.existsConflict.mockResolvedValue(true); // conflit avec réservation confirmée
    mockBlocage.create.mockResolvedValue({
      id: 'b-uuid',
      logementId: 'log-uuid',
      tenantId: 'tenant-A',
      dateDebut: conflictEvent.dateDebut,
      dateFin: conflictEvent.dateFin,
      source: SourceBlocage.AIRBNB,
      statut: 'CONFLIT',
    });
    mockNotif.sendConflitIcalAlert.mockResolvedValue();

    const result = await useCase.execute(
      'log-uuid',
      'tenant-A',
      'test@gite.fr',
      'Gîte',
    );

    expect(result.conflitsDetectes).toBe(1);
    expect(mockNotif.sendConflitIcalAlert).toHaveBeenCalledWith(
      'test@gite.fr',
      'Gîte',
      conflictEvent.dateDebut,
      conflictEvent.dateFin,
    );
    expect(mockBlocage.create).toHaveBeenCalledWith(
      expect.objectContaining({ statut: 'CONFLIT' }),
    );
  });

  // TEST-ICAL-05 — Idempotence (pas de doublon si blocage existe déjà)
  it('TEST-ICAL-05: ne crée pas de doublon si blocage existe déjà', async () => {
    mockIcalRepo.getUrls.mockResolvedValue({
      urlIcalAirbnb: 'https://airbnb.fr/ical/xxx.ics',
    });
    mockFetcher.fetch.mockResolvedValue([event1]);
    mockBlocage.findByDateRange.mockResolvedValue([
      {
        id: 'existing',
        logementId: 'log-uuid',
        tenantId: 'tenant-A',
        dateDebut: event1.dateDebut,
        dateFin: event1.dateFin,
        source: SourceBlocage.AIRBNB,
      },
    ]);

    const result = await useCase.execute(
      'log-uuid',
      'tenant-A',
      'test@gite.fr',
      'Gîte',
    );

    expect(result.blocagesCrees).toBe(0);
    expect(mockBlocage.create).not.toHaveBeenCalled();
  });

  // TEST-ICAL-06 — Aucune URL configurée
  it('TEST-ICAL-06: retourne 0 blocage si aucune URL iCal configurée', async () => {
    mockIcalRepo.getUrls.mockResolvedValue(null);

    const result = await useCase.execute(
      'log-uuid',
      'tenant-A',
      'test@gite.fr',
      'Gîte',
    );

    expect(result.blocagesCrees).toBe(0);
    expect(result.conflitsDetectes).toBe(0);
    expect(mockFetcher.fetch).not.toHaveBeenCalled();
  });

  // TEST-ICAL-07 — Synchronisation source Booking
  it('TEST-ICAL-07: crée 1 blocage source BOOKING depuis URL Booking', async () => {
    mockIcalRepo.getUrls.mockResolvedValue({
      urlIcalBooking: 'https://booking.com/ical/xxx.ics',
    });
    mockFetcher.fetch.mockResolvedValue([event1]);
    mockBlocage.findByDateRange.mockResolvedValue([]);
    mockDispo.existsConflict.mockResolvedValue(false);
    mockBlocage.create.mockResolvedValue({
      id: 'b-uuid',
      logementId: 'log-uuid',
      tenantId: 'tenant-A',
      dateDebut: event1.dateDebut,
      dateFin: event1.dateFin,
      source: SourceBlocage.BOOKING,
    });

    const result = await useCase.execute(
      'log-uuid',
      'tenant-A',
      'test@gite.fr',
      'Gîte',
    );

    expect(result.blocagesCrees).toBe(1);
    expect(mockBlocage.create).toHaveBeenCalledWith(
      expect.objectContaining({ source: SourceBlocage.BOOKING }),
    );
  });
});
