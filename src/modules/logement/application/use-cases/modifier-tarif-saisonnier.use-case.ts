import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import {
  TARIF_REPOSITORY,
  ITarifRepository,
} from '../../domain/ports/tarif.repository.port';
import { TarifSaisonnierDomain } from '../../domain/ports/logement.repository.port';

@Injectable()
export class ModifierTarifSaisonnierUseCase {
  constructor(
    @Inject(TARIF_REPOSITORY)
    private readonly tarifRepository: ITarifRepository,
  ) {}

  async execute(
    id: string,
    tenantId: string,
    data: Partial<TarifSaisonnierDomain>,
  ): Promise<TarifSaisonnierDomain> {
    const updated = await this.tarifRepository.updateSaisonnier(
      id,
      tenantId,
      data,
    );
    if (!updated) throw new NotFoundException('Tarif saisonnier introuvable');
    return updated;
  }
}
