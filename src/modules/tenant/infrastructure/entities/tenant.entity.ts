import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum StatutAbonnement {
  ESSAI = 'ESSAI',
  ACTIF = 'ACTIF',
  SUSPENDU = 'SUSPENDU',
  RESILIE = 'RESILIE',
}

@Entity('tenants')
export class TenantEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 255 })
  raisonSociale: string;

  @Column({ unique: true, length: 255 })
  email: string;

  @Column()
  motDePasseHash: string;

  @Column({ type: 'enum', enum: StatutAbonnement, default: StatutAbonnement.ESSAI })
  abonnementStatut: StatutAbonnement;

  @Column({ type: 'timestamp', nullable: true })
  abonnementDebut: Date | null;

  @Column({ type: 'timestamp', nullable: true })
  abonnementFin: Date | null;

  @Column({ type: 'varchar', nullable: true, unique: true })
  tokenPublicWidget: string | null;

  @Column({ type: 'jsonb', nullable: true })
  widgetConfig: {
    couleurPrimaire?: string;
    couleurSecondaire?: string;
    couleurTexte?: string;
    police?: string;
    borderRadius?: number;
    logoUrl?: string;
  } | null;

  @Column({ default: false })
  isAdmin: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
