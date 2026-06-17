import { Injectable, Inject, BadRequestException } from '@nestjs/common';
import {
  PAIEMENT_REPOSITORY,
  IPaiementRepository,
  PaiementDomain,
  TypePaiement,
  StatutPaiement,
} from '../../domain/ports/paiement.repository.port';
import {
  RESERVATION_PAIEMENT_REPOSITORY,
  IReservationPaiementRepository,
} from '../../domain/ports/reservation-paiement.repository.port';
import {
  STRIPE_SERVICE,
  IStripeService,
} from '@modules/reservation/domain/ports/stripe.service.port';

@Injectable()
export class ConfirmerPaiementUseCase {
  constructor(
    @Inject(PAIEMENT_REPOSITORY)
    private readonly paiementRepository: IPaiementRepository,
    @Inject(RESERVATION_PAIEMENT_REPOSITORY)
    private readonly reservationRepository: IReservationPaiementRepository,
    @Inject(STRIPE_SERVICE) private readonly stripeService: IStripeService,
  ) {}

  async execute(paymentIntentId: string): Promise<PaiementDomain> {
    // Idempotence — retourner sans doublon si déjà capturé
    const existant =
      await this.paiementRepository.findByPaymentIntentId(paymentIntentId);
    if (existant && existant.statut === StatutPaiement.CAPTURE) {
      return existant;
    }

    const reservation =
      await this.reservationRepository.findByPaymentIntentId(paymentIntentId);
    if (!reservation) {
      throw new BadRequestException('PaymentIntent invalide ou non confirmé');
    }

    const pi = await this.stripeService.retrievePaymentIntent(paymentIntentId);
    if (pi.status !== 'succeeded') {
      throw new BadRequestException('PaymentIntent invalide ou non confirmé');
    }

    const montant = pi.amount / 100;
    const hasAcompte =
      reservation.montantAcompte !== undefined &&
      reservation.montantAcompte !== null;
    const type = hasAcompte ? TypePaiement.ACOMPTE : TypePaiement.TOTAL;

    const paiement = await this.paiementRepository.save({
      reservationId: reservation.id,
      tenantId: reservation.tenantId,
      type,
      statut: StatutPaiement.CAPTURE,
      montant,
      stripePaymentIntentId: paymentIntentId,
    });

    await this.reservationRepository.updateStatut(reservation.id, 'CONFIRMEE');

    return paiement;
  }
}
