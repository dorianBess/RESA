import { Body, Controller, Param, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '@shared/guards/jwt-auth.guard';
import { ConfirmerPaiementUseCase } from '../../application/use-cases/confirmer-paiement.use-case';
import { RembourserPaiementUseCase } from '../../application/use-cases/rembourser-paiement.use-case';

@Controller('paiements')
export class PaiementController {
  constructor(
    private readonly confirmer: ConfirmerPaiementUseCase,
    private readonly rembourser: RembourserPaiementUseCase,
  ) {}

  @Post('confirmer')
  confirmerPaiement(@Body() body: { paymentIntentId: string }) {
    return this.confirmer.execute(body.paymentIntentId);
  }

  @Post(':id/rembourser')
  @UseGuards(JwtAuthGuard)
  rembourserPaiement(
    @Param('id') id: string,
    @Body() body: { montant?: number },
  ) {
    return this.rembourser.execute(id, body.montant);
  }
}
