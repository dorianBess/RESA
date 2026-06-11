import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('photos')
export class PhotoEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  logementId: string;

  @Column()
  tenantId: string;

  @Column()
  url: string;

  @Column({ default: 0 })
  ordre: number;

  @CreateDateColumn()
  createdAt: Date;
}
