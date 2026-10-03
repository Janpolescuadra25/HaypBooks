import { Module } from '@nestjs/common';
import { PrismaRepositoriesModule } from '../repositories/prisma/prisma-repositories.module';
import { CheckoutController } from './checkout.controller';
import { StripeService } from './stripe.service';
import { StripeWebhookController } from './stripe-webhook.controller';

@Module({
  imports: [PrismaRepositoriesModule],
  controllers: [StripeWebhookController, CheckoutController],
  providers: [StripeService],
  exports: [StripeService],
})
export class BillingModule {}