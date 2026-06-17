import {
  Injectable,
  Inject,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import {
  PAIEMENT_REPOSITORY,
  IPaiementRepository,
  PaiementDomain,
  StatutPaiement,
} from '../../domain/ports/paiement.repository.port';
import {
  STRIPE_SERVICE,
  IStripeService,
} from '@modules/reservation/domain/ports/stripe.service.port';

@Injectable()
export class RembourserPaiementUseCase {
  constructor(
    @Inject(PAIEMENT_REPOSITORY)
    private readonly paiementRepository: IPaiementRepository,
    @Inject(STRIPE_SERVICE) private readonly stripeService: IStripeService,
  ) {}

  async execute(paiementId: string, montant?: number): Promise<PaiementDomain> {
    const paiement = await this.paiementRepository.findById(paiementId);
    if (!paiement) throw new NotFoundException('Paiement introuvable');

    if (montant !== undefined && montant > paiement.montant) {
      throw new BadRequestException(
        'Le montant du remboursement ne peut pas dépasser le montant payé',
      );
    }

    const montantRembourse = montant ?? paiement.montant;
    await this.stripeService.refund(
      paiement.stripePaymentIntentId,
      Math.round(montantRembourse * 100),
    );

    const updated = await this.paiementRepository.updateStatut(
      paiementId,
      StatutPaiement.REMBOURSE,
      montantRembourse,
    );
    return updated!;
  }
}
