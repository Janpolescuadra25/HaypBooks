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

  async createCheckoutSession(params: {
    workspaceId: string;
    userEmail: string;
    priceId: string;
    successUrl?: string;
    cancelUrl?: string;
  }): Promise<Stripe.Checkout.Session> {
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    const successUrl = params.successUrl || `${frontendUrl}/workspaces/${params.workspaceId}/settings/billing?checkout=success`;
    const cancelUrl = params.cancelUrl || `${frontendUrl}/workspaces/${params.workspaceId}/settings/billing?checkout=canceled`;

    return this.stripeClient.checkout.sessions.create({
      mode: 'subscription',
      customer_email: params.userEmail,
      client_reference_id: params.workspaceId,
      line_items: [
        {
          price: params.priceId,
          quantity: 1,
        },
      ],
      metadata: {
        workspaceId: params.workspaceId,
      },
      success_url: successUrl,
      cancel_url: cancelUrl,
    });
  }
}