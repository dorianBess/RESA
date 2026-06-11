import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('tarifs_base')
export class TarifBaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  logementId: string;

  @Column()
  tenantId: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  prixParNuit: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  prixSemaine: number | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
