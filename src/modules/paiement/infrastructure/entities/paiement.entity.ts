import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { StatutPaiement, TypePaiement } from '../../domain/ports/paiement.repository.port';

@Entity('paiements')
export class PaiementEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  reservationId: string;

  @Column()
  tenantId: string;

  @Column({ type: 'enum', enum: TypePaiement })
  type: TypePaiement;

  @Column({ type: 'enum', enum: StatutPaiement, default: StatutPaiement.EN_ATTENTE })
  statut: StatutPaiement;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  montant: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  montantRembourse: number | null;

  @Column()
  stripePaymentIntentId: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
