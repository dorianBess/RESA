import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  IPaiementRepository,
  PaiementDomain,
  StatutPaiement,
} from '../../domain/ports/paiement.repository.port';
import { PaiementEntity } from '../entities/paiement.entity';

@Injectable()
export class PaiementRepository implements IPaiementRepository {
  constructor(
    @InjectRepository(PaiementEntity)
    private readonly repo: Repository<PaiementEntity>,
  ) {}

  async findById(id: string): Promise<PaiementDomain | null> {
    const p = await this.repo.findOne({ where: { id } });
    return p ? this.toDomain(p) : null;
  }

  async findByPaymentIntentId(
    paymentIntentId: string,
  ): Promise<PaiementDomain | null> {
    const p = await this.repo.findOne({
      where: { stripePaymentIntentId: paymentIntentId },
    });
    return p ? this.toDomain(p) : null;
  }

  async save(
    data: Omit<PaiementDomain, 'id' | 'createdAt' | 'updatedAt'>,
  ): Promise<PaiementDomain> {
    const entity = this.repo.create(data as any) as unknown as PaiementEntity;
    return this.toDomain(await this.repo.save(entity));
  }

  async updateStatut(
    id: string,
    statut: StatutPaiement,
    montantRembourse?: number,
  ): Promise<PaiementDomain | null> {
    await this.repo.update(id, {
      statut,
      montantRembourse: montantRembourse ?? null,
    } as any);
    return this.findById(id);
  }

  private toDomain(p: PaiementEntity): PaiementDomain {
    return {
      id: p.id,
      reservationId: p.reservationId,
      tenantId: p.tenantId,
      type: p.type,
      statut: p.statut,
      montant: Number(p.montant),
      montantRembourse: p.montantRembourse
        ? Number(p.montantRembourse)
        : undefined,
      stripePaymentIntentId: p.stripePaymentIntentId,
      createdAt: p.createdAt,
      updatedAt: p.updatedAt,
    };
  }
}
