import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn,
} from 'typeorm';
import { StatutReservation } from '../../domain/ports/reservation.repository.port';

@Entity('reservations')
export class ReservationEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  tenantId: string;

  @Column()
  logementId: string;

  @Column({ type: 'date' })
  dateDebut: Date;

  @Column({ type: 'date' })
  dateFin: Date;

  @Column()
  nbNuits: number;

  @Column()
  nbPersonnes: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  montantTotal: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  montantAcompte: number | null;

  @Column({ type: 'enum', enum: StatutReservation, default: StatutReservation.EN_ATTENTE })
  statut: StatutReservation;

  @Column()
  voyageurNom: string;

  @Column()
  voyageurPrenom: string;

  @Column()
  voyageurEmail: string;

  @Column({ nullable: true })
  voyageurTelephone: string | null;

  @Column({ nullable: true })
  notes: string | null;

  @Column({ nullable: true })
  stripePaymentIntentId: string | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
