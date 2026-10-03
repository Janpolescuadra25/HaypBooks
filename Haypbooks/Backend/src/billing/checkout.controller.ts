import {
  BadRequestException,
  Body,
  Controller,
  NotFoundException,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import type { Request } from 'express';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { WorkspaceAccessGuard } from '../auth/guards/workspace-access.guard';
import { PrismaService } from '../repositories/prisma/prisma.service';
import { CreateCustomerPortalDto } from './dtos/create-customer-portal.dto';
import { CreateCheckoutSessionDto } from './dtos/create-checkout-session.dto';
import { StripeService } from './stripe.service';

@Controller('billing')
export class CheckoutController {
  constructor(
    private readonly stripeService: StripeService,
    private readonly prisma: PrismaService,
  ) {}

  @Post('workspaces/:workspaceId/checkout')
  @UseGuards(JwtAuthGuard, WorkspaceAccessGuard, RolesGuard)
  @Roles('OWNER')
  async createCheckoutSession(
    @Param('workspaceId') workspaceId: string,
    @Body() dto: CreateCheckoutSessionDto,
    @Req() req: Request,
  ) {
    const user = (req as any).user;
    if (!user || !user.email) {
      throw new BadRequestException('Authenticated user email is required');
    }

    const plan = await this.prisma.plan.findUnique({
      where: { id: dto.planId },
    });

    if (!plan) {
      throw new NotFoundException(`Plan with ID ${dto.planId} not found`);
    }

    const priceId = dto.interval === 'monthly'
      ? plan.stripeMonthlyPriceId
      : plan.stripeAnnualPriceId;

    if (!priceId) {
      throw new BadRequestException(
        `Plan ${plan.name ?? dto.planId} does not have a Stripe ${dto.interval} price configured`,
      );
    }

    const session = await this.stripeService.createCheckoutSession({
      workspaceId,
      userEmail: user.email,
      priceId,
      successUrl: dto.successUrl,
      cancelUrl: dto.cancelUrl,
    });

    return {
      sessionId: session.id,
      url: session.url,
    };
  }

  @Post('workspaces/:workspaceId/customer-portal')
  @UseGuards(JwtAuthGuard, WorkspaceAccessGuard, RolesGuard)
  @Roles('OWNER')
  async createCustomerPortalSession(
    @Param('workspaceId') workspaceId: string,
    @Body() dto: CreateCustomerPortalDto = {} as CreateCustomerPortalDto,
  ) {
    const subscription = await this.prisma.subscription.findFirst({
      where: {
        OR: [{ companyId: workspaceId }, { practiceId: workspaceId }],
      },
    });

    if (!subscription || !subscription.stripeCustomerId) {
      throw new BadRequestException('Workspace does not have an active Stripe customer account');
    }

    const session = await this.stripeService.createCustomerPortalSession({
      stripeCustomerId: subscription.stripeCustomerId,
      returnUrl: dto?.returnUrl,
    });

    return {
      url: session.url,
    };
  }
}
