import { ExecutionContext, ForbiddenException, UnauthorizedException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { WorkspaceAccessGuard } from './workspace-access.guard';
import { PrismaService } from '../../prisma/prisma.service';

describe('WorkspaceAccessGuard', () => {
  let guard: WorkspaceAccessGuard;
  let prisma: {
    workspaceUser: {
      findFirst: jest.Mock;
    };
  };

  const createMockContext = (req: any): ExecutionContext => ({
    switchToHttp: () => ({
      getRequest: () => req,
      getResponse: () => ({}),
      getNext: () => ({}),
    }),
    getClass: () => ({} as any),
    getHandler: () => ({} as any),
    getArgs: () => [] as any,
    getArgByIndex: () => ({}) as any,
    switchToRpc: () => ({}) as any,
    switchToWs: () => ({}) as any,
    getType: () => 'http',
  });

  beforeEach(async () => {
    prisma = {
      workspaceUser: {
        findFirst: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WorkspaceAccessGuard,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    guard = module.get<WorkspaceAccessGuard>(WorkspaceAccessGuard);
  });

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  it('should throw UnauthorizedException if user is missing', async () => {
    const context = createMockContext({});
    await expect(guard.canActivate(context)).rejects.toThrow(UnauthorizedException);
  });

  it('should throw ForbiddenException if workspaceId cannot be resolved', async () => {
    const context = createMockContext({ user: { id: 'user-1' } });
    await expect(guard.canActivate(context)).rejects.toThrow(ForbiddenException);
  });

  it('should throw ForbiddenException if user is not an active workspace member', async () => {
    prisma.workspaceUser.findFirst.mockResolvedValue(null);
    const context = createMockContext({
      user: { id: 'user-1', workspaceId: 'ws-1' },
    });

    await expect(guard.canActivate(context)).rejects.toThrow(ForbiddenException);
    expect(prisma.workspaceUser.findFirst).toHaveBeenCalledWith({
      where: {
        workspaceId: 'ws-1',
        userId: 'user-1',
        status: 'ACTIVE',
        deletedAt: null,
      },
    });
  });

  it('should allow access and attach workspace context when membership is active', async () => {
    const mockMembership = {
      workspaceId: 'ws-1',
      userId: 'user-1',
      status: 'ACTIVE',
      deletedAt: null,
      isOwner: true,
    };
    prisma.workspaceUser.findFirst.mockResolvedValue(mockMembership);

    const req = {
      user: { id: 'user-1', workspaceId: 'ws-1' },
      params: {},
      query: {},
      headers: {},
    };
    const context = createMockContext(req);

    const result = await guard.canActivate(context);
    expect(result).toBe(true);
    expect((req as any).workspaceId).toBe('ws-1');
    expect((req as any).workspaceUser).toBe(mockMembership);
  });

  it('should resolve workspaceId from request params if provided', async () => {
    const mockMembership = {
      workspaceId: 'ws-custom',
      userId: 'user-1',
      status: 'ACTIVE',
      deletedAt: null,
    };
    prisma.workspaceUser.findFirst.mockResolvedValue(mockMembership);

    const req = {
      user: { id: 'user-1', workspaceId: 'ws-default' },
      params: { workspaceId: 'ws-custom' },
      query: {},
      headers: {},
    };
    const context = createMockContext(req);

    const result = await guard.canActivate(context);
    expect(result).toBe(true);
    expect(prisma.workspaceUser.findFirst).toHaveBeenCalledWith({
      where: {
        workspaceId: 'ws-custom',
        userId: 'user-1',
        status: 'ACTIVE',
        deletedAt: null,
      },
    });
    expect((req as any).workspaceId).toBe('ws-custom');
  });

  it('should resolve workspaceId from request headers if provided', async () => {
    const mockMembership = {
      workspaceId: 'ws-header',
      userId: 'user-1',
      status: 'ACTIVE',
      deletedAt: null,
    };
    prisma.workspaceUser.findFirst.mockResolvedValue(mockMembership);

    const req = {
      user: { id: 'user-1' },
      params: {},
      query: {},
      headers: { 'x-workspace-id': 'ws-header' },
    };
    const context = createMockContext(req);

    const result = await guard.canActivate(context);
    expect(result).toBe(true);
    expect(prisma.workspaceUser.findFirst).toHaveBeenCalledWith({
      where: {
        workspaceId: 'ws-header',
        userId: 'user-1',
        status: 'ACTIVE',
        deletedAt: null,
      },
    });
  });
});