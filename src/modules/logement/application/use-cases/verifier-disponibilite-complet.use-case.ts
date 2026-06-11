import { Injectable, Inject, BadRequestException, ConflictException } from '@nestjs/common';
import { LOGEMENT_REPOSITORY, ILogementRepository } from '../../domain/ports/logement.repository.port';
import { BLOCAGE_REPOSITORY, IBlocageRepository } from '../../domain/ports/blocage.repository.port';
import { DISPONIBILITE_REPOSITORY, IDisponibiliteRepository } from '../../domain/ports/disponibilite.repository.port';
import { TARIF_REPOSITORY, ITarifRepository } from '../../domain/ports/tarif.repository.port';
import { CONFIG_ACOMPTE_REPOSITORY, IConfigAcompteRepository } from '../../domain/ports/config-acompte.repository.port';

export interface VerifierDisponibiliteCommand {
  logementId: string;
  tenantId: string;
  dateDebut: Date;
  dateFin: Date;
  nbPersonnes: number;
}

export interface DisponibiliteResult {
  disponible: boolean;
  nbNuits: number;
  montantTotal: number;
  montantAcompte: number | null;
  acompteActif: boolean;
}

@Injectable()
export class VerifierDisponibiliteCompletUseCase {
  constructor(
    @Inject(LOGEMENT_REPOSITORY) private readonly logementRepository: ILogementRepository,
    @Inject(BLOCAGE_REPOSITORY) private readonly blocageRepository: IBlocageRepository,
    @Inject(DISPONIBILITE_REPOSITORY) private readonly disponibiliteRepository: IDisponibiliteRepository,
    @Inject(TARIF_REPOSITORY) private readonly tarifRepository: ITarifRepository,
    @Inject(CONFIG_ACOMPTE_REPOSITORY) private readonly configAcompteRepository: IConfigAcompteRepository,
  ) {}

  async execute(command: VerifierDisponibiliteCommand): Promise<DisponibiliteResult> {
    if (command.dateFin <= command.dateDebut) {
      throw new BadRequestException('La date de fin doit être postérieure à la date de début');
    }

    const logement = await this.logementRepository.findById(command.logementId, command.tenantId);
    if (!logement) throw new ConflictException('Logement introuvable');

    if (command.nbPersonnes > logement.capacite) {
      throw new ConflictException(`Capacité insuffisante pour ${command.nbPersonnes} personnes`);
    }

    // Vérifie réservations + holds
    const conflitResa = await this.disponibiliteRepository.existsConflict(
      command.logementId, command.dateDebut, command.dateFin,
    );
    if (conflitResa) {
      throw new ConflictException({ disponible: false });
    }

    // Vérifie blocages (iCal, manuel)
    const conflitBlocage = await this.blocageRepository.existsConflict(
      command.logementId, command.dateDebut, command.dateFin,
    );
    if (conflitBlocage) {
      throw new ConflictException({ disponible: false });
    }

    const nbNuits = Math.ceil(
      (command.dateFin.getTime() - command.dateDebut.getTime()) / (1000 * 60 * 60 * 24),
    );

    // Calcul du tarif (saisonnier prioritaire sur base)
    const tarifSaisonnier = await this.tarifRepository.findApplicable(
      command.logementId, command.dateDebut, command.dateFin,
    );
    const tarifBase = await this.tarifRepository.findBase(command.logementId);
    const prixParNuit = tarifSaisonnier?.prixParNuit ?? tarifBase?.prixParNuit ?? 0;
    const montantTotal = nbNuits * prixParNuit;

    // Config acompte
    const configAcompte = await this.configAcompteRepository.findByLogement(command.logementId);
    const acompteActif = configAcompte?.actif ?? false;
    const montantAcompte = acompteActif && configAcompte
      ? Math.round(montantTotal * configAcompte.pourcentage) / 100
      : null;

    return { disponible: true, nbNuits, montantTotal, montantAcompte, acompteActif };
  }
}
