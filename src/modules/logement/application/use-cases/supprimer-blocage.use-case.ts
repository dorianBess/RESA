import {
  Injectable,
  Inject,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import {
  BLOCAGE_REPOSITORY,
  IBlocageRepository,
  SourceBlocage,
} from '../../domain/ports/blocage.repository.port';

@Injectable()
export class SupprimerBlocageUseCase {
  constructor(
    @Inject(BLOCAGE_REPOSITORY)
    private readonly blocageRepository: IBlocageRepository,
  ) {}

  async execute(blocageId: string, _tenantId: string): Promise<void> {
    const blocage = await this.blocageRepository.findById(blocageId);
    if (!blocage) throw new NotFoundException('Blocage introuvable');

    if (
      blocage.source === SourceBlocage.AIRBNB ||
      blocage.source === SourceBlocage.BOOKING
    ) {
      throw new ForbiddenException(
        'Impossible de supprimer un blocage importé depuis une plateforme externe',
      );
    }
    await this.blocageRepository.delete(blocageId);
  }
}
