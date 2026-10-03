import { Module } from '@nestjs/common';
import { PrismaRepositoriesModule } from '../repositories/prisma/prisma-repositories.module';
import { StripeService } from './stripe.service';
import { StripeWebhookController } from './stripe-webhook.controller';

@Module({
  imports: [PrismaRepositoriesModule],
  controllers: [StripeWebhookController],
  providers: [StripeService],
  exports: [StripeService],
})
export class BillingModule {}