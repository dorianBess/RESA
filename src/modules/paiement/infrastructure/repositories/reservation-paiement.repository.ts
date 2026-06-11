import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  IReservationPaiementRepository,
  ReservationForPaiement,
} from '../../domain/ports/reservation-paiement.repository.port';
import { ReservationEntity } from '@modules/reservation/infrastructure/entities/reservation.entity';

@Injectable()
export class ReservationPaiementRepository implements IReservationPaiementRepository {
  constructor(
    @InjectRepository(ReservationEntity)
    private readonly repo: Repository<ReservationEntity>,
  ) {}

  async findByPaymentIntentId(paymentIntentId: string): Promise<ReservationForPaiement | null> {
    const r = await this.repo.findOne({ where: { stripePaymentIntentId: paymentIntentId } });
    if (!r) return null;
    return {
      id: r.id,
      tenantId: r.tenantId,
      statut: r.statut,
      montantTotal: Number(r.montantTotal),
      montantAcompte: r.montantAcompte != null ? Number(r.montantAcompte) : undefined,
      stripePaymentIntentId: r.stripePaymentIntentId ?? undefined,
    };
  }

  async updateStatut(id: string, statut: string): Promise<void> {
    await this.repo.update(id, { statut: statut as any });
  }
}
