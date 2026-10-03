import { Injectable } from '@nestjs/common';
import Stripe from 'stripe';

@Injectable()
export class StripeService {
  private readonly stripeClient: Stripe;

  constructor() {
    const apiKey = process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder';
    this.stripeClient = new Stripe(apiKey, {
      apiVersion: '2023-10-16' as any,
    });
  }

  getClient(): Stripe {
    return this.stripeClient;
  }

  constructEvent(payload: Buffer, signature: string): Stripe.Event {
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || '';
    if (!webhookSecret) {
      throw new Error('STRIPE_WEBHOOK_SECRET is not configured');
    }

    return this.stripeClient.webhooks.constructEvent(payload, signature, webhookSecret);
  }
}