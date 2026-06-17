import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IIcalRepository } from '../../domain/ports/ical.repository.port';
import { LogementEntity } from '../entities/logement.entity';

@Injectable()
export class IcalRepository implements IIcalRepository {
  constructor(
    @InjectRepository(LogementEntity)
    private readonly repo: Repository<LogementEntity>,
  ) {}

  async saveUrls(
    logementId: string,
    _tenantId: string,
    data: { urlIcalAirbnb?: string; urlIcalBooking?: string },
  ): Promise<void> {
    await this.repo.update(logementId, {
      urlIcalAirbnb: data.urlIcalAirbnb ?? undefined,
      urlIcalBooking: data.urlIcalBooking ?? undefined,
    } as any);
  }

  async getUrls(
    logementId: string,
  ): Promise<{ urlIcalAirbnb?: string; urlIcalBooking?: string } | null> {
    const l = await this.repo.findOne({ where: { id: logementId } });
    if (!l) return null;
    return {
      urlIcalAirbnb: l.urlIcalAirbnb ?? undefined,
      urlIcalBooking: l.urlIcalBooking ?? undefined,
    };
  }
}
