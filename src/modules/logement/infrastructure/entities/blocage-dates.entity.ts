import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';
import { SourceBlocage } from '../../domain/ports/blocage.repository.port';

@Entity('blocages_dates')
export class BlocageDatesEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  logementId: string;

  @Column()
  tenantId: string;

  @Column({ type: 'date' })
  dateDebut: Date;

  @Column({ type: 'date' })
  dateFin: Date;

  @Column({ type: 'enum', enum: SourceBlocage })
  source: SourceBlocage;

  @Column({ type: 'varchar', nullable: true })
  motif: string | null;

  @Column({ default: 'NORMAL' })
  statut: string;

  @CreateDateColumn()
  createdAt: Date;
}
