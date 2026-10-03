import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { PracticeHubService } from './practice-hub.service';
import { PrismaService } from '../repositories/prisma/prisma.service';
import { MailService } from '../common/mail.service';

describe('PracticeHubService - Capacity Gating', () => {
  let service: PracticeHubService;
  let prismaService: any;
  let mailService: any;

  beforeEach(async () => {
    prismaService = {
      practiceUser: {
        findFirst: jest.fn(),
      },
      practice: {
        findUnique: jest.fn(),
      },
      practiceInvite: {
        findFirst: jest.fn(),
        create: jest.fn(),
      },
      engagement: {
        findFirst: jest.fn(),
        count: jest.fn(),
      },
    };

    mailService = {
      buildInviteHtml: jest.fn(() => '<html>invite</html>'),
      buildInviteText: jest.fn(() => 'invite'),
      sendEmail: jest.fn().mockResolvedValue(undefined),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PracticeHubService,
        { provide: PrismaService, useValue: prismaService },
        { provide: MailService, useValue: mailService },
      ],
    }).compile();

    service = module.get<PracticeHubService>(PracticeHubService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should throw NotFoundException if the practice is not found for the user', async () => {
    prismaService.practiceUser.findFirst.mockResolvedValue(null);

    await expect(
      service.createInvite('user-1', {
        email: 'client@example.com',
        engagementName: 'Bookkeeping',
        engagementType: 'BOOKKEEPING',
        startDate: new Date().toISOString(),
      }),
    ).rejects.toThrow(NotFoundException);
  });

  it('should throw BadRequestException if the active engagement count reaches the plan limit', async () => {
    prismaService.practiceUser.findFirst.mockResolvedValue({ practiceId: 'prac-1' });
    prismaService.practice.findUnique.mockResolvedValue({
      id: 'prac-1',
      name: 'Accounting Experts',
      subscription: { plan: { maxClients: 5 } },
    });
    prismaService.practiceInvite.findFirst.mockResolvedValue(null);
    prismaService.engagement.findFirst.mockResolvedValue(null);
    prismaService.engagement.count.mockResolvedValue(5);

    await expect(
      service.createInvite('user-1', {
        email: 'client@example.com',
        engagementName: 'Bookkeeping',
        engagementType: 'BOOKKEEPING',
        startDate: new Date().toISOString(),
      }),
    ).rejects.toThrow(BadRequestException);
  });

  it('should allow invite creation when the active engagement count is below the plan limit', async () => {
    prismaService.practiceUser.findFirst.mockResolvedValue({ practiceId: 'prac-1' });
    prismaService.practice.findUnique.mockResolvedValue({
      id: 'prac-1',
      name: 'Accounting Experts',
      subscription: { plan: { maxClients: 5 } },
    });
    prismaService.practiceInvite.findFirst.mockResolvedValue(null);
    prismaService.engagement.findFirst.mockResolvedValue(null);
    prismaService.engagement.count.mockResolvedValue(3);
    prismaService.practiceInvite.create.mockResolvedValue({
      id: 'invite-1',
      code: 'abc123',
      status: 'PENDING',
    });

    const result = await service.createInvite('user-1', {
      email: 'client@example.com',
      engagementName: 'Bookkeeping',
      engagementType: 'BOOKKEEPING',
      startDate: new Date().toISOString(),
    });

    expect(result).toBeDefined();
    expect(prismaService.practiceInvite.create).toHaveBeenCalled();
  });
});
