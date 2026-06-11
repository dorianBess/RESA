import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { StatutLogement } from '../../domain/ports/logement.repository.port';

@Entity('logements')
export class LogementEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  tenantId: string;

  @Column()
  nom: string;

  @Column({ nullable: true, type: 'text' })
  description: string | null;

  @Column()
  capacite: number;

  @Column({ type: 'enum', enum: StatutLogement, default: StatutLogement.ACTIF })
  statut: StatutLogement;

  @Column({ type: 'varchar', nullable: true })
  urlIcalAirbnb: string | null;

  @Column({ type: 'varchar', nullable: true })
  urlIcalBooking: string | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
