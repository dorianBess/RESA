import { Injectable, Inject, BadRequestException } from '@nestjs/common';
import { ICAL_REPOSITORY, IIcalRepository } from '../../domain/ports/ical.repository.port';

function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

export interface ConfigurerIcalCommand {
  logementId: string;
  tenantId: string;
  urlIcalAirbnb?: string;
  urlIcalBooking?: string;
}

@Injectable()
export class ConfigurerIcalUseCase {
  constructor(
    @Inject(ICAL_REPOSITORY) private readonly icalRepository: IIcalRepository,
  ) {}

  async execute(command: ConfigurerIcalCommand): Promise<void> {
    if (command.urlIcalAirbnb && !isValidUrl(command.urlIcalAirbnb)) {
      throw new BadRequestException("Format d'URL invalide");
    }
    if (command.urlIcalBooking && !isValidUrl(command.urlIcalBooking)) {
      throw new BadRequestException("Format d'URL invalide");
    }
    await this.icalRepository.saveUrls(command.logementId, command.tenantId, {
      urlIcalAirbnb: command.urlIcalAirbnb,
      urlIcalBooking: command.urlIcalBooking,
    });
  }
}
