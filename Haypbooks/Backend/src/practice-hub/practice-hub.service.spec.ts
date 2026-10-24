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
      task: {
        count: jest.fn(),
        findMany: jest.fn(),
      },
      practiceCalendar: {
        findMany: jest.fn(),
      },
      engagement: {
        findFirst: jest.fn(),
        count: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        findMany: jest.fn(),
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

  describe('Existing Dashboard & Client Operations', () => {
    it('should return dashboard stats for active clients, open tasks, pending reviews, and completed MTD', async () => {
      prismaService.engagement.count.mockResolvedValueOnce(6);
      prismaService.task.count.mockResolvedValueOnce(9);
      prismaService.task.count.mockResolvedValueOnce(3);
      prismaService.task.count.mockResolvedValueOnce(4);

      const result = await service.getDashboardStats('prac-1');

      expect(result).toEqual({
        activeClients: 6,
        openTasks: 9,
        pendingReviews: 3,
        completedMtd: 4,
      });
      expect(prismaService.engagement.count).toHaveBeenCalledWith({
        where: { practiceId: 'prac-1', status: 'ACTIVE' },
      });
      expect(prismaService.task.count).toHaveBeenCalledTimes(3);
    });

    it('should return recent activity items mapped from recent practice tasks', async () => {
      prismaService.task.findMany.mockResolvedValue([
        {
          id: 'task-1',
          title: 'Quarter-end review',
          status: 'DONE',
          updatedAt: new Date('2026-03-15T12:00:00.000Z'),
          company: { name: 'Northwind Foods' },
        },
        {
          id: 'task-2',
          title: 'Payroll checkup',
          status: 'IN_PROGRESS',
          updatedAt: new Date('2026-03-14T07:15:00.000Z'),
          company: { name: 'Summit Group' },
        },
      ]);

      const result = await service.getRecentActivity('prac-1');

      expect(result).toEqual([
        {
          id: 'task-1',
          client: 'Northwind Foods',
          action: 'Quarter-end review',
          time: '2026-03-15T12:00:00.000Z',
          status: 'done',
        },
        {
          id: 'task-2',
          client: 'Summit Group',
          action: 'Payroll checkup',
          time: '2026-03-14T07:15:00.000Z',
          status: 'info',
        },
      ]);
      expect(prismaService.task.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { practiceId: 'prac-1', deletedAt: null },
          take: 10,
        }),
      );
    });

    it('should return upcoming deadlines sorted by due date with urgent flags', async () => {
      prismaService.practiceCalendar.findMany.mockResolvedValue([]);
      prismaService.task.findMany.mockResolvedValue([
        {
          id: 'task-1',
          title: '2026 tax filing',
          dueDate: new Date('2026-03-20T00:00:00.000Z'),
          priority: 'URGENT',
          company: { name: 'Apex Works' },
        },
        {
          id: 'task-2',
          title: 'Monthly close',
          dueDate: new Date('2026-03-15T00:00:00.000Z'),
          priority: 'NORMAL',
          company: { name: 'Blue Rock' },
        },
      ]);

      const result = await service.getUpcomingDeadlines('prac-1');

      expect(result).toEqual([
        {
          id: 'task-2',
          label: 'Monthly close — Blue Rock',
          date: '2026-03-15T00:00:00.000Z',
          urgent: false,
        },
        {
          id: 'task-1',
          label: '2026 tax filing — Apex Works',
          date: '2026-03-20T00:00:00.000Z',
          urgent: true,
        },
      ]);
    });

    it('should return the active client list with engagement details', async () => {
      prismaService.engagement.findMany.mockResolvedValue([
        {
          id: 'eng-1',
          companyId: 'comp-1',
          name: 'Year-end audit',
          type: 'AUDIT',
          startDate: new Date('2026-01-15T00:00:00.000Z'),
          endDate: new Date('2026-12-31T00:00:00.000Z'),
          company: { id: 'comp-1', name: 'Northwind Foods' },
        },
        {
          id: 'eng-2',
          companyId: 'comp-2',
          name: 'Tax planning',
          type: 'TAX',
          startDate: new Date('2026-02-01T00:00:00.000Z'),
          endDate: null,
          company: { id: 'comp-2', name: 'Summit Group' },
        },
      ]);

      const result = await service.getClientList('prac-1');

      expect(result).toEqual([
        {
          id: 'eng-1',
          companyId: 'comp-1',
          companyName: 'Northwind Foods',
          engagementName: 'Year-end audit',
          type: 'AUDIT',
          startDate: '2026-01-15T00:00:00.000Z',
          endDate: '2026-12-31T00:00:00.000Z',
        },
        {
          id: 'eng-2',
          companyId: 'comp-2',
          companyName: 'Summit Group',
          engagementName: 'Tax planning',
          type: 'TAX',
          startDate: '2026-02-01T00:00:00.000Z',
          endDate: null,
        },
      ]);
    });
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