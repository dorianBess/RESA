import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('tarifs_saisonniers')
export class TarifSaisonnierEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  logementId: string;

  @Column()
  tenantId: string;

  @Column()
  nom: string;

  @Column({ type: 'date' })
  dateDebut: Date;

  @Column({ type: 'date' })
  dateFin: Date;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  prixParNuit: number;

  @Column({ default: 1 })
  priorite: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
