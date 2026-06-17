import { IsIn } from 'class-validator';

export class ModifierStatutDto {
  @IsIn(['ESSAI', 'ACTIF', 'SUSPENDU', 'RESILIE'], {
    message: 'Statut invalide',
  })
  statut!: string;
}
