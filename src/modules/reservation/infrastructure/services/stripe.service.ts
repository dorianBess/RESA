import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';
import { IStripeService } from '../../domain/ports/stripe.service.port';

@Injectable()
export class StripeService implements IStripeService {
  private readonly stripe: Stripe;
  private readonly isMock: boolean;

  constructor(private readonly config: ConfigService) {
    const key = config.get<string>('STRIPE_SECRET_KEY') ?? '';
    this.isMock = !key || key.includes('...');
    this.stripe = new Stripe(this.isMock ? 'sk_test_placeholder' : key, {
      apiVersion: '2023-10-16' as any,
    });
  }

  async createPaymentIntent(
    amountCents: number,
    metadata: Record<string, string>,
  ) {
    if (this.isMock) {
      return {
        id: `mock_pi_${Date.now()}`,
        clientSecret: `mock_secret_${Date.now()}`,
      };
    }
    const pi = await this.stripe.paymentIntents.create({
      amount: amountCents,
      currency: 'eur',
      metadata,
    });
    return { id: pi.id, clientSecret: pi.client_secret! };
  }

  async retrievePaymentIntent(paymentIntentId: string) {
    const pi = await this.stripe.paymentIntents.retrieve(paymentIntentId);
    return { id: pi.id, status: pi.status, amount: pi.amount };
  }

  async refund(paymentIntentId: string, amountCents?: number): Promise<void> {
    await this.stripe.refunds.create({
      payment_intent: paymentIntentId,
      ...(amountCents ? { amount: amountCents } : {}),
    });
  }
}
