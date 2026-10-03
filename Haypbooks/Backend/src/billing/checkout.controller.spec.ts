import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../repositories/prisma/prisma.service';
import { StripeService } from './stripe.service';
import { CheckoutController } from './checkout.controller';

describe('CheckoutController', () => {
  let controller: CheckoutController;
  let stripeService: { createCheckoutSession: jest.Mock };
  let prismaService: { plan: { findUnique: jest.Mock } };

  beforeEach(async () => {
    stripeService = {
      createCheckoutSession: jest.fn(),
    };

    prismaService = {
      plan: {
        findUnique: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [CheckoutController],
      providers: [
        { provide: StripeService, useValue: stripeService },
        { provide: PrismaService, useValue: prismaService },
      ],
    }).compile();

    controller = module.get<CheckoutController>(CheckoutController);
  });

  it('should create a checkout session and return session metadata', async () => {
    prismaService.plan.findUnique.mockResolvedValue({
      id: 'plan_123',
      name: 'Pro',
      stripeMonthlyPriceId: 'price_monthly_123',
      stripeAnnualPriceId: 'price_annual_456',
    });

    stripeService.createCheckoutSession.mockResolvedValue({
      id: 'cs_test_123',
      url: 'https://checkout.stripe.com/session/cs_test_123',
    });

    const result = await controller.createCheckoutSession('ws_123', {
      planId: 'plan_123',
      interval: 'monthly',
    }, { user: { email: 'owner@example.com' } } as any);

    expect(result).toEqual({
      sessionId: 'cs_test_123',
      url: 'https://checkout.stripe.com/session/cs_test_123',
    });
    expect(stripeService.createCheckoutSession).toHaveBeenCalledWith({
      workspaceId: 'ws_123',
      userEmail: 'owner@example.com',
      priceId: 'price_monthly_123',
      successUrl: undefined,
      cancelUrl: undefined,
    });
  });

  it('should throw NotFoundException when plan is missing', async () => {
    prismaService.plan.findUnique.mockResolvedValue(null);

    await expect(
      controller.createCheckoutSession('ws_123', { planId: 'missing_plan', interval: 'monthly' }, {
        user: { email: 'owner@example.com' },
      } as any),
    ).rejects.toThrow(NotFoundException);
  });

  it('should throw BadRequestException when the plan has no Stripe price for the selected interval', async () => {
    prismaService.plan.findUnique.mockResolvedValue({
      id: 'plan_123',
      name: 'Pro',
      stripeMonthlyPriceId: null,
      stripeAnnualPriceId: null,
    });

    await expect(
      controller.createCheckoutSession('ws_123', { planId: 'plan_123', interval: 'annual' }, {
        user: { email: 'owner@example.com' },
      } as any),
    ).rejects.toThrow(BadRequestException);
  });
});
