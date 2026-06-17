import {
  Injectable,
  Inject,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import {
  RESERVATION_REPOSITORY,
  IReservationRepository,
  ReservationDomain,
  StatutReservation,
} from '../../domain/ports/reservation.repository.port';
import {
  STRIPE_SERVICE,
  IStripeService,
} from '../../domain/ports/stripe.service.port';

export interface LogementInfo {
  id: string;
  tenantId: string;
  capacite: number;
  prixParNuit: number;
  acompteConfig?: { actif: boolean; pourcentage: number } | null;
}

export interface CreerReservationCommand {
  tenantId: string;
  logementId: string;
  dateDebut: Date;
  dateFin: Date;
  nbPersonnes: number;
  voyageurNom: string;
  voyageurPrenom: string;
  voyageurEmail: string;
  voyageurTelephone?: string;
  notes?: string;
  logement: LogementInfo;
}

export interface CreerReservationResult {
  reservation: ReservationDomain;
  clientSecret: string;
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

@Injectable()
export class CreerReservationUseCase {
  constructor(
    @Inject(RESERVATION_REPOSITORY)
    private readonly reservationRepository: IReservationRepository,
    @Inject(STRIPE_SERVICE) private readonly stripeService: IStripeService,
  ) {}

  async execute(
    command: CreerReservationCommand,
  ): Promise<CreerReservationResult> {
    if (!EMAIL_REGEX.test(command.voyageurEmail)) {
      throw new BadRequestException("Format d'email invalide");
    }

    // Vérification disponibilité (reservations + holds)
    const conflict = await this.reservationRepository.existsConflict(
      command.logementId,
      command.dateDebut,
      command.dateFin,
    );
    if (conflict) {
      throw new ConflictException('Ces dates ne sont plus disponibles');
    }
    const holdActif = await this.reservationRepository.existsActiveHold(
      command.logementId,
      command.dateDebut,
      command.dateFin,
    );
    if (holdActif) {
      throw new ConflictException('Ces dates ne sont plus disponibles');
    }

    const nbNuits = Math.ceil(
      (command.dateFin.getTime() - command.dateDebut.getTime()) /
        (1000 * 60 * 60 * 24),
    );
    const montantTotal = nbNuits * command.logement.prixParNuit;
    const acompteConfig = command.logement.acompteConfig;
    const montantAcompte = acompteConfig?.actif
      ? Math.round(montantTotal * acompteConfig.pourcentage) / 100
      : null;

    const montantStripe = montantAcompte ?? montantTotal;
    const pi = await this.stripeService.createPaymentIntent(
      Math.round(montantStripe * 100),
      { logementId: command.logementId, tenantId: command.tenantId },
    );

    // Créer le hold
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
    await this.reservationRepository.createHold({
      tenantId: command.tenantId,
      logementId: command.logementId,
      dateDebut: command.dateDebut,
      dateFin: command.dateFin,
      expiresAt,
      statut: 'ACTIF',
    });

    const reservation = await this.reservationRepository.save({
      tenantId: command.tenantId,
      logementId: command.logementId,
      dateDebut: command.dateDebut,
      dateFin: command.dateFin,
      nbNuits,
      nbPersonnes: command.nbPersonnes,
      montantTotal,
      montantAcompte: montantAcompte ?? undefined,
      statut: StatutReservation.EN_ATTENTE,
      voyageurNom: command.voyageurNom,
      voyageurPrenom: command.voyageurPrenom,
      voyageurEmail: command.voyageurEmail,
      voyageurTelephone: command.voyageurTelephone,
      notes: command.notes,
    });

    return { reservation, clientSecret: pi.clientSecret };
  }
}
