import { Injectable } from '@nestjs/common';
import { INotificationService } from '../../domain/ports/ical.repository.port';

@Injectable()
export class NotificationService implements INotificationService {
  async sendConflitIcalAlert(
    tenantEmail: string,
    logementNom: string,
    dateDebut: Date,
    dateFin: Date,
  ): Promise<void> {
    // stub — implement with AWS SES in production
    console.log(`[ALERT] Conflit iCal pour ${logementNom}: ${dateDebut} - ${dateFin} → ${tenantEmail}`);
  }
}
