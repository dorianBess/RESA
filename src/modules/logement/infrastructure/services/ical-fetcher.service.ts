import { Injectable } from '@nestjs/common';
import {
  IIcalFetcher,
  IcalEvent,
} from '../../domain/ports/ical.repository.port';

@Injectable()
export class IcalFetcherService implements IIcalFetcher {
  async fetch(url: string): Promise<IcalEvent[]> {
    try {
      const ical = await import('node-ical');
      const data = await ical.fromURL(url);
      const events: IcalEvent[] = [];
      for (const event of Object.values(data)) {
        if ((event as any).type === 'VEVENT') {
          const e = event as any;
          events.push({
            uid: e.uid,
            dateDebut: e.start,
            dateFin: e.end,
            summary: e.summary,
          });
        }
      }
      return events;
    } catch {
      return [];
    }
  }
}
