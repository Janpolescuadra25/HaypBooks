import { BadRequestException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../repositories/prisma/prisma.service';
import { StripeService } from './stripe.service';
import { StripeWebhookController } from './stripe-webhook.controller';

describe('StripeWebhookController', () => {
  let controller: StripeWebhookController;
  let stripeService: {
    constructEvent: jest.Mock;
  };
  let prismaService: {
    stripeWebhookEvent: {
      findUnique: jest.Mock;
      upsert: jest.Mock;
    };
    subscription: {
      updateMany: jest.Mock;
    };
  };

  beforeEach(async () => {
    stripeService = {
      constructEvent: jest.fn(),
    };

    prismaService = {
      stripeWebhookEvent: {
        findUnique: jest.fn(),
        upsert: jest.fn(),
      },
      subscription: {
        updateMany: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [StripeWebhookController],
      providers: [
        { provide: StripeService, useValue: stripeService },
        { provide: PrismaService, useValue: prismaService },
      ],
    }).compile();

    controller = module.get<StripeWebhookController>(StripeWebhookController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should throw BadRequestException when stripe signature is missing', async () => {
    await expect(controller.handleWebhook({ body: Buffer.from('{}') } as any, undefined as any)).rejects.toThrow(BadRequestException);
  });

  it('should throw BadRequestException when raw body is not a Buffer', async () => {
    await expect(controller.handleWebhook({ body: '{bad-json}' } as any, 'sig_test')).rejects.toThrow(BadRequestException);
  });

  it('should return duplicate response when event was already processed', async () => {
    stripeService.constructEvent.mockReturnValue({
      id: 'evt_duplicate',
      type: 'customer.subscription.updated',
      data: { object: { id: 'sub_123', status: 'active' } },
    });

    prismaService.stripeWebhookEvent.findUnique.mockResolvedValue({
      stripeEventId: 'evt_duplicate',
      status: 'PROCESSED',
    });

    const result = await controller.handleWebhook({ body: Buffer.from('{}') } as any, 'sig_test');

    expect(result).toEqual({ received: true, duplicate: true });
    expect(prismaService.subscription.updateMany).not.toHaveBeenCalled();
  });

  it('should update subscription lifecycle metadata and record webhook when event is valid', async () => {
    stripeService.constructEvent.mockReturnValue({
      id: 'evt_new',
      type: 'customer.subscription.updated',
      data: {
        object: {
          id: 'sub_123',
          customer: 'cus_test_123',
          status: 'active',
          current_period_start: 1700000000,
          current_period_end: 1702600000,
          cancel_at_period_end: true,
        },
      },
    });

    prismaService.stripeWebhookEvent.findUnique.mockResolvedValue(null);
    prismaService.subscription.updateMany.mockResolvedValue({ count: 1 });
    prismaService.stripeWebhookEvent.upsert.mockResolvedValue({});

    const result = await controller.handleWebhook({ body: Buffer.from('{}') } as any, 'sig_test');

    expect(result).toEqual({ received: true });
    expect(prismaService.subscription.updateMany).toHaveBeenCalledWith({
      where: { stripeSubscriptionId: 'sub_123' },
      data: {
        status: 'ACTIVE',
        stripeCustomerId: 'cus_test_123',
        currentPeriodStart: new Date(1700000000 * 1000),
        currentPeriodEnd: new Date(1702600000 * 1000),
        cancelAtPeriodEnd: true,
      },
    });
    expect(prismaService.stripeWebhookEvent.upsert).toHaveBeenCalledWith(expect.objectContaining({
      where: { stripeEventId: 'evt_new' },
      update: expect.objectContaining({ status: 'PROCESSED' }),
      create: expect.objectContaining({ stripeEventId: 'evt_new', type: 'customer.subscription.updated', status: 'PROCESSED' }),
    }));
  });
});
