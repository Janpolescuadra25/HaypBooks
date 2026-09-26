import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from '../../repositories/prisma/prisma.service';
import { setRequestContext } from '../../shared/async-context';

@Injectable()
export class WorkspaceAccessGuard implements CanActivate {
  constructor(private readonly prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    const userId = user?.userId ?? user?.id;

    if (!user || !userId) {
      throw new UnauthorizedException('Authentication required');
    }

    const rawWorkspaceId =
      request.params?.workspaceId ??
      request.params?.tenantId ??
      request.query?.workspaceId ??
      request.query?.tenantId ??
      request.headers?.['x-workspace-id'] ??
      request.headers?.['x-tenant-id'] ??
      user.workspaceId ??
      user.tenantId;

    const workspaceId = Array.isArray(rawWorkspaceId) ? rawWorkspaceId[0] : rawWorkspaceId;

    if (!workspaceId || typeof workspaceId !== 'string') {
      throw new ForbiddenException('Workspace context is required');
    }

    const membership = await this.prisma.workspaceUser.findFirst({
      where: {
        workspaceId,
        userId,
        status: 'ACTIVE',
        deletedAt: null,
      },
    });

    if (!membership) {
      throw new ForbiddenException('Access denied: You do not have active membership in this workspace');
    }

    request.workspaceId = workspaceId;
    request.workspaceUser = membership;
    setRequestContext({ workspaceId, userId });

    return true;
  }
}