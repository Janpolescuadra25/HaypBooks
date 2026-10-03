import { Test, TestingModule } from '@nestjs/testing';
import { WorkspaceAccessGuard } from './workspace-access.guard';
import { PrismaService } from '../../repositories/prisma/prisma.service';
import { UnauthorizedException, ForbiddenException, ExecutionContext } from '@nestjs/common';

describe('WorkspaceAccessGuard', () => {
  let guard: WorkspaceAccessGuard;
  let prismaService: any;

  beforeEach(async () => {
    prismaService = {
      workspaceUser: {
        findFirst: jest.fn(),
      },
      engagement: {
        findFirst: jest.fn(),
      },
      company: {
        findUnique: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WorkspaceAccessGuard,
        { provide: PrismaService, useValue: prismaService },
      ],
    }).compile();

    guard = module.get<WorkspaceAccessGuard>(WorkspaceAccessGuard);
  });

  const createMockContext = (user: any, params: any = {}, headers: any = {}, body: any = {}, query: any = {}): ExecutionContext => {
    const request = {
      user,
      params,
      headers,
      body,
      query,
    };
    return {
      switchToHttp: () => ({
        getRequest: () => request,
      }),
    } as any;
  };

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  it('should throw UnauthorizedException if user is missing', async () => {
    const context = createMockContext(null, { workspaceId: 'ws-1' });
    await expect(guard.canActivate(context)).rejects.toThrow(UnauthorizedException);
  });

  it('should throw ForbiddenException if workspaceId cannot be resolved', async () => {
    const context = createMockContext({ id: 'u-1' });
    await expect(guard.canActivate(context)).rejects.toThrow(ForbiddenException);
  });

  it('should allow access if user has direct workspace membership', async () => {
    prismaService.workspaceUser.findFirst.mockResolvedValue({
      id: 'wu-1',
      workspaceId: 'ws-1',
      userId: 'u-1',
      status: 'ACTIVE',
    });

    const context = createMockContext({ id: 'u-1' }, { workspaceId: 'ws-1' });
    const result = await guard.canActivate(context);
    expect(result).toBe(true);
  });

  it('should allow access if the user has active practice engagement delegation', async () => {
    prismaService.workspaceUser.findFirst.mockResolvedValue(null);
    prismaService.engagement.findFirst.mockResolvedValue({
      id: 'eng-1',
      status: 'ACTIVE',
      practice: { id: 'prac-1', name: 'Accounting Experts' },
      company: { id: 'comp-1', workspaceId: 'ws-client-1' },
    });

    const context = createMockContext({ id: 'u-1' }, { workspaceId: 'ws-client-1' });
    const result = await guard.canActivate(context);
    expect(result).toBe(true);
  });

  it('should throw ForbiddenException if user has neither direct membership nor practice delegation', async () => {
    prismaService.workspaceUser.findFirst.mockResolvedValue(null);
    prismaService.engagement.findFirst.mockResolvedValue(null);

    const context = createMockContext({ id: 'u-1' }, { workspaceId: 'ws-client-1' });
    await expect(guard.canActivate(context)).rejects.toThrow(ForbiddenException);
  });
});