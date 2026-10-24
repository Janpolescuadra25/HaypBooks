import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, ConflictException, NotFoundException } from '@nestjs/common';
import { PracticeHubService } from './practice-hub.service';
import { PrismaService } from '../repositories/prisma/prisma.service';
import { MailService } from '../common/mail.service';

describe('PracticeHubService - Capacity Gating, Invite Races & Revocation', () => {
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
        findUnique: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        updateMany: jest.fn(),
      },
      engagement: {
        findFirst: jest.fn(),
        count: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
      },
      user: {
        findUnique: jest.fn(),
      },
      company: {
        findFirst: jest.fn(),
      },
      $transaction: jest.fn((cb: any) => cb(prismaService)),
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

  it('should throw BadRequestException if the active engagement count reaches the plan limit on createInvite', async () => {
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

  describe('assertPracticeOwner', () => {
    it('should resolve without error when the user is an active OWNER', async () => {
      prismaService.practiceUser.findFirst.mockResolvedValue({
        id: 'pu-1',
        practiceId: 'prac-1',
        userId: 'user-1',
        role: 'OWNER',
        status: 'ACTIVE',
      });

      await expect(service.assertPracticeOwner('prac-1', 'user-1')).resolves.toBeUndefined();
    });

    it('should throw ForbiddenException when the user is not an active OWNER', async () => {
      prismaService.practiceUser.findFirst.mockResolvedValue(null);

      await expect(service.assertPracticeOwner('prac-1', 'user-2')).rejects.toThrow('Practice owner access required');
    });

    it('should throw ForbiddenException when the user has STAFF role', async () => {
      prismaService.practiceUser.findFirst.mockResolvedValue(null);

      await expect(service.assertPracticeOwner('prac-1', 'user-3')).rejects.toThrow('Practice owner access required');
    });
  });

  describe('acceptInvite - acceptance-time capacity & atomic race protection', () => {
    const validInvite = {
      id: 'inv-1',
      code: 'code-123',
      practiceId: 'prac-1',
      email: 'client@example.com',
      engagementName: '2026 Bookkeeping',
      engagementType: 'BOOKKEEPING',
      startDate: new Date('2026-01-01T00:00:00.000Z'),
      expiresAt: new Date(Date.now() + 86400000),
      status: 'PENDING',
    };

    it('should enforce maxClients capacity at acceptance time and throw BadRequestException when full', async () => {
      prismaService.practiceInvite.findUnique.mockResolvedValue(validInvite);
      prismaService.user.findUnique.mockResolvedValue({ id: 'user-client', email: 'client@example.com' });
      prismaService.company.findFirst.mockResolvedValue({ id: 'comp-1' });
      prismaService.engagement.findFirst.mockResolvedValue(null);
      prismaService.practice.findUnique.mockResolvedValue({
        id: 'prac-1',
        isActive: true,
        subscription: { plan: { maxClients: 2 } },
      });
      prismaService.engagement.count.mockResolvedValue(2);

      await expect(service.acceptInvite('user-client', 'code-123', 'comp-1')).rejects.toThrow(
        BadRequestException,
      );
      expect(prismaService.engagement.create).not.toHaveBeenCalled();
    });

    it('should throw ConflictException if concurrent acceptance race causes updateMany count to be 0', async () => {
      prismaService.practiceInvite.findUnique.mockResolvedValue(validInvite);
      prismaService.user.findUnique.mockResolvedValue({ id: 'user-client', email: 'client@example.com' });
      prismaService.company.findFirst.mockResolvedValue({ id: 'comp-1' });
      prismaService.engagement.findFirst.mockResolvedValue(null);
      prismaService.practice.findUnique.mockResolvedValue({
        id: 'prac-1',
        isActive: true,
        subscription: { plan: { maxClients: 5 } },
      });
      prismaService.engagement.count.mockResolvedValue(1);
      prismaService.engagement.create.mockResolvedValue({ id: 'eng-1' });
      prismaService.practiceInvite.updateMany.mockResolvedValue({ count: 0 });

      await expect(service.acceptInvite('user-client', 'code-123', 'comp-1')).rejects.toThrow(
        ConflictException,
      );
    });

    it('should accept invite and create active engagement when below capacity and race check succeeds', async () => {
      prismaService.practiceInvite.findUnique.mockResolvedValue(validInvite);
      prismaService.user.findUnique.mockResolvedValue({ id: 'user-client', email: 'client@example.com' });
      prismaService.company.findFirst.mockResolvedValue({ id: 'comp-1' });
      prismaService.engagement.findFirst.mockResolvedValue(null);
      prismaService.practice.findUnique.mockResolvedValue({
        id: 'prac-1',
        isActive: true,
        subscription: { plan: { maxClients: 5 } },
      });
      prismaService.engagement.count.mockResolvedValue(1);
      prismaService.engagement.create.mockResolvedValue({ id: 'eng-1', status: 'ACTIVE' });
      prismaService.practiceInvite.updateMany.mockResolvedValue({ count: 1 });

      const result = await service.acceptInvite('user-client', 'code-123', 'comp-1');
      expect(result).toEqual({ id: 'eng-1', status: 'ACTIVE' });
      expect(prismaService.practiceInvite.updateMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'inv-1', status: 'PENDING' },
        }),
      );
    });
  });

  describe('revokeInvite & revokeEngagement', () => {
    it('should revoke a PENDING invite for the practice', async () => {
      prismaService.practiceUser.findFirst.mockResolvedValue({ practiceId: 'prac-1' });
      prismaService.practice.findUnique.mockResolvedValue({ id: 'prac-1', isActive: true });
      prismaService.practiceInvite.findFirst.mockResolvedValue({
        id: 'inv-1',
        practiceId: 'prac-1',
        status: 'PENDING',
      });
      prismaService.practiceInvite.update.mockResolvedValue({
        id: 'inv-1',
        practiceId: 'prac-1',
        status: 'REVOKED',
      });

      const res = await service.revokeInvite('user-1', 'inv-1');
      expect(res.status).toBe('REVOKED');
      expect(prismaService.practiceInvite.update).toHaveBeenCalledWith({
        where: { id: 'inv-1' },
        data: { status: 'REVOKED' },
      });
    });

    it('should reject revoking a non-PENDING invite', async () => {
      prismaService.practiceUser.findFirst.mockResolvedValue({ practiceId: 'prac-1' });
      prismaService.practice.findUnique.mockResolvedValue({ id: 'prac-1', isActive: true });
      prismaService.practiceInvite.findFirst.mockResolvedValue({
        id: 'inv-1',
        practiceId: 'prac-1',
        status: 'ACCEPTED',
      });

      await expect(service.revokeInvite('user-1', 'inv-1')).rejects.toThrow(BadRequestException);
    });

    it('should archive an ACTIVE engagement on revokeEngagement so active relationship checks fail closed and capacity is freed', async () => {
      prismaService.practiceUser.findFirst.mockResolvedValue({ practiceId: 'prac-1' });
      prismaService.practice.findUnique.mockResolvedValue({ id: 'prac-1', isActive: true });
      prismaService.engagement.findFirst.mockResolvedValue({
        id: 'eng-1',
        practiceId: 'prac-1',
        status: 'ACTIVE',
      });
      prismaService.engagement.update.mockResolvedValue({
        id: 'eng-1',
        practiceId: 'prac-1',
        status: 'ARCHIVED',
      });

      const res = await service.revokeEngagement('user-1', 'eng-1');
      expect(res.status).toBe('ARCHIVED');
      expect(prismaService.engagement.update).toHaveBeenCalledWith({
        where: { id: 'eng-1' },
        data: expect.objectContaining({ status: 'ARCHIVED', endDate: expect.any(Date) }),
      });
    });

    it('should reject revoking a non-ACTIVE engagement', async () => {
      prismaService.practiceUser.findFirst.mockResolvedValue({ practiceId: 'prac-1' });
      prismaService.practice.findUnique.mockResolvedValue({ id: 'prac-1', isActive: true });
      prismaService.engagement.findFirst.mockResolvedValue({
        id: 'eng-1',
        practiceId: 'prac-1',
        status: 'ARCHIVED',
      });

      await expect(service.revokeEngagement('user-1', 'eng-1')).rejects.toThrow(BadRequestException);
    });
  });
});