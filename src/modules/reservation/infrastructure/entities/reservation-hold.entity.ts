import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

@Entity('reservation_holds')
export class ReservationHoldEntity {
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

  @Column({ type: 'timestamp' })
  expiresAt: Date;

  @Column({ default: 'ACTIF' })
  statut: string;

  @CreateDateColumn()
  createdAt: Date;
}
