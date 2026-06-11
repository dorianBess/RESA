import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('configs_acompte')
export class ConfigAcompteEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  logementId: string;

  @Column()
  tenantId: string;

  @Column({ default: false })
  actif: boolean;

  @Column({ default: 30 })
  pourcentage: number;

  @Column({ default: 30 })
  delaiSoldeJours: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
