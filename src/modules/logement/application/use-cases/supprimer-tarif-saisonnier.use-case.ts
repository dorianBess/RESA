import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import {
  TARIF_REPOSITORY,
  ITarifRepository,
} from '../../domain/ports/tarif.repository.port';

@Injectable()
export class SupprimerTarifSaisonnierUseCase {
  constructor(
    @Inject(TARIF_REPOSITORY)
    private readonly tarifRepository: ITarifRepository,
  ) {}

  async execute(id: string, tenantId: string): Promise<void> {
    const deleted = await this.tarifRepository.deleteSaisonnier(id, tenantId);
    if (!deleted) throw new NotFoundException('Tarif saisonnier introuvable');
  }
}
