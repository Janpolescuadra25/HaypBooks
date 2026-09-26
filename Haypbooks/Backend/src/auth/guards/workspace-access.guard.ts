import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class WorkspaceAccessGuard implements CanActivate {
  constructor(private readonly prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user || !user.id) {
      throw new UnauthorizedException('Authentication required');
    }

    const workspaceId =
      request.params?.workspaceId ||
      request.query?.workspaceId ||
      request.headers?.['x-workspace-id'] ||
      user.workspaceId ||
      user.tenantId;

    if (!workspaceId || typeof workspaceId !== 'string') {
      throw new ForbiddenException('Workspace context is required');
    }

    const membership = await this.prisma.workspaceUser.findFirst({
      where: {
        workspaceId,
        userId: user.id,
        status: 'ACTIVE',
        deletedAt: null,
      },
    });

    if (!membership) {
      throw new ForbiddenException('Access denied: You do not have active membership in this workspace');
    }

    request.workspaceId = workspaceId;
    request.workspaceUser = membership;

    try {
      const contextModule = require('../../common/context');
      if (contextModule && typeof contextModule.setRequestContext === 'function') {
        contextModule.setRequestContext({ workspaceId, userId: user.id });
      }
    } catch (error) {
      // Graceful fallback if async context store is not initialized
    }

    return true;
  }
}