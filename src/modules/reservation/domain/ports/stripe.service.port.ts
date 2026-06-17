export const STRIPE_SERVICE = Symbol('STRIPE_SERVICE');

export interface IStripeService {
  createPaymentIntent(
    amountCents: number,
    metadata: Record<string, string>,
  ): Promise<{
    id: string;
    clientSecret: string;
  }>;
  retrievePaymentIntent(paymentIntentId: string): Promise<{
    id: string;
    status: string;
    amount: number;
  }>;
  refund(paymentIntentId: string, amountCents?: number): Promise<void>;
}
