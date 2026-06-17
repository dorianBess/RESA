import { Injectable } from '@nestjs/common';

export interface TarifApplicable {
  prixParNuit: number;
}

export interface CalculerPrixResult {
  nbNuits: number;
  montantTotal: number;
  montantAcompte: number | null;
}

@Injectable()
export class CalculerPrixUseCase {
  execute(
    dateDebut: Date,
    dateFin: Date,
    prixParNuit: number,
    acompteConfig?: { actif: boolean; pourcentage: number } | null,
  ): CalculerPrixResult {
    const nbNuits = Math.ceil(
      (dateFin.getTime() - dateDebut.getTime()) / (1000 * 60 * 60 * 24),
    );
    const montantTotal = nbNuits * prixParNuit;
    const montantAcompte = acompteConfig?.actif
      ? Math.round(montantTotal * acompteConfig.pourcentage) / 100
      : null;
    return { nbNuits, montantTotal, montantAcompte };
  }
}
