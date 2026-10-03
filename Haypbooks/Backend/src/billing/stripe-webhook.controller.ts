import {
  BadRequestException,
  Controller,
  Headers,
  HttpCode,
  HttpStatus,
  Logger,
  Post,
  Req,
} from '@nestjs/common';
import type { Request } from 'express';
import Stripe from 'stripe';
import { PrismaService } from '../repositories/prisma/prisma.service';
import { StripeService } from './stripe.service';

@Controller('billing/webhooks')
export class StripeWebhookController {
  private readonly logger = new Logger(StripeWebhookController.name);

  constructor(
    private readonly stripeService: StripeService,
    private readonly prisma: PrismaService,
  ) {}

  @Post('stripe')
  @HttpCode(HttpStatus.OK)
  async handleWebhook(
    @Req() req: Request,
    @Headers('stripe-signature') signature: string,
  ) {
    if (!signature) {
      throw new BadRequestException('Missing stripe-signature header');
    }

    const rawBody = (req as any).body;
    if (!Buffer.isBuffer(rawBody)) {
      this.logger.error('Raw request body is missing or not a Buffer for Stripe signature verification');
      throw new BadRequestException('Raw request body missing');
    }

    let event: Stripe.Event;
    try {
      event = this.stripeService.constructEvent(rawBody, signature);
    } catch (err: any) {
      this.logger.warn(`Stripe signature verification failed: ${err.message}`);
      throw new BadRequestException(`Webhook Error: ${err.message}`);
    }

    const existing = await this.prisma.stripeWebhookEvent.findUnique({
      where: { stripeEventId: event.id },
    });

    if (existing && existing.status === 'PROCESSED') {
      this.logger.log(`Skipping duplicate Stripe event ${event.id}`);
      return { received: true, duplicate: true };
    }

    try {
      switch (event.type) {
        case 'customer.subscription.created':
        case 'customer.subscription.updated': {
          const subscription = event.data.object as Stripe.Subscription & {
            current_period_start?: number;
            current_period_end?: number;
            cancel_at_period_end?: boolean;
            customer?: string | { id?: string };
          };
          await this.updateSubscriptionStatus(subscription.id, subscription.status, subscription);
          break;
        }
        case 'customer.subscription.deleted': {
          const subscription = event.data.object as Stripe.Subscription & {
            current_period_start?: number;
            current_period_end?: number;
            cancel_at_period_end?: boolean;
            customer?: string | { id?: string };
          };
          await this.updateSubscriptionStatus(subscription.id, 'CANCELED', { ...subscription, cancel_at_period_end: false });
          break;
        }
        case 'invoice.payment_succeeded': {
          const invoice = event.data.object as Stripe.Invoice & { subscription?: string | null };
          if (invoice.subscription) {
            await this.updateSubscriptionStatus(invoice.subscription, 'ACTIVE');
          }
          break;
        }
        case 'invoice.payment_failed': {
          const invoice = event.data.object as Stripe.Invoice & { subscription?: string | null };
          if (invoice.subscription) {
            await this.updateSubscriptionStatus(invoice.subscription, 'PAST_DUE');
          }
          break;
        }
        default:
          this.logger.log(`Unhandled Stripe event type: ${event.type}`);
      }

      await this.prisma.stripeWebhookEvent.upsert({
        where: { stripeEventId: event.id },
        update: {
          status: 'PROCESSED',
          processedAt: new Date(),
          type: event.type,
        },
        create: {
          stripeEventId: event.id,
          type: event.type,
          status: 'PROCESSED',
          processedAt: new Date(),
        },
      });

      return { received: true };
    } catch (err: any) {
      this.logger.error(`Error processing Stripe event ${event.id}: ${err.message}`, err.stack);
      await this.prisma.stripeWebhookEvent.upsert({
        where: { stripeEventId: event.id },
        update: {
          status: 'FAILED',
          processingErrors: { message: err.message },
          processedAt: new Date(),
        },
        create: {
          stripeEventId: event.id,
          type: event.type,
          status: 'FAILED',
          processingErrors: { message: err.message },
          processedAt: new Date(),
        },
      });
      throw err;
    }
  }

  private async updateSubscriptionStatus(
    subscriptionId: string | null,
    status: string,
    subscription?: Stripe.Subscription & {
      current_period_start?: number;
      current_period_end?: number;
      cancel_at_period_end?: boolean;
      customer?: string | { id?: string };
    },
  ) {
    if (!subscriptionId) {
      return;
    }

    const mappedStatus = this.mapStripeSubscriptionStatus(status);
    if (!mappedStatus) {
      return;
    }

    const data: Record<string, unknown> = { status: mappedStatus };

    if (subscription) {
      const customerId = typeof subscription.customer === 'string'
        ? subscription.customer
        : subscription.customer?.id;

      if (customerId) {
        data.stripeCustomerId = customerId;
      }

      if (typeof subscription.current_period_start === 'number') {
        data.currentPeriodStart = new Date(subscription.current_period_start * 1000);
      }

      if (typeof subscription.current_period_end === 'number') {
        data.currentPeriodEnd = new Date(subscription.current_period_end * 1000);
      }

      if (typeof subscription.cancel_at_period_end === 'boolean') {
        data.cancelAtPeriodEnd = subscription.cancel_at_period_end;
      }
    }

    await this.prisma.subscription.updateMany({
      where: { stripeSubscriptionId: subscriptionId },
      data,
    });
  }

  private mapStripeSubscriptionStatus(status: string): 'TRIAL' | 'ACTIVE' | 'PAST_DUE' | 'CANCELED' | 'UNPAID' | null {
    const normalized = String(status || '').toLowerCase();

    switch (normalized) {
      case 'trialing':
        return 'TRIAL';
      case 'active':
        return 'ACTIVE';
      case 'past_due':
        return 'PAST_DUE';
      case 'canceled':
      case 'cancelled':
        return 'CANCELED';
      case 'unpaid':
        return 'UNPAID';
      default:
        return null;
    }
  }
}
