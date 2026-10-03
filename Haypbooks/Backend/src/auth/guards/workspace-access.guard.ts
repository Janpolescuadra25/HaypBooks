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

    let workspaceId =
      request.params?.workspaceId ??
      request.params?.tenantId ??
      request.query?.workspaceId ??
      request.query?.tenantId ??
      request.headers?.['x-workspace-id'] ??
      request.headers?.['x-tenant-id'] ??
      user.workspaceId ??
      user.tenantId;

    if (Array.isArray(workspaceId)) {
      throw new ForbiddenException('Workspace context is required');
    }

    if (!workspaceId && request.params?.companyId) {
      const company = await this.prisma.company.findUnique({
        where: { id: request.params.companyId },
        select: { workspaceId: true },
      });

      if (!company) {
        throw new ForbiddenException('Company context is invalid');
      }

      workspaceId = company.workspaceId;
    }

    const normalizedWorkspaceId = Array.isArray(workspaceId) ? workspaceId[0] : workspaceId;

    if (!normalizedWorkspaceId || typeof normalizedWorkspaceId !== 'string') {
      throw new ForbiddenException('Workspace context is required');
    }

    const membership = await this.prisma.workspaceUser.findFirst({
      where: {
        workspaceId: normalizedWorkspaceId,
        userId,
        status: 'ACTIVE',
        deletedAt: null,
      },
    });

    if (!membership || membership.status !== 'ACTIVE' || membership.deletedAt) {
      const practiceAccess = await this.prisma.engagement.findFirst({
        where: {
          company: {
            workspaceId: normalizedWorkspaceId,
          },
          status: 'ACTIVE',
          practice: {
            isActive: true,
            practiceUsers: {
              some: {
                userId,
              },
            },
          },
        },
        include: {
          company: true,
          practice: true,
        },
      });

      if (practiceAccess) {
        request.workspaceId = normalizedWorkspaceId;
        request.practiceAccess = practiceAccess;
        setRequestContext({ workspaceId: normalizedWorkspaceId, userId });
        return true;
      }

      throw new ForbiddenException(
        'Access denied: You do not have active membership or practice access in this workspace',
      );
    }

    request.workspaceId = normalizedWorkspaceId;
    request.workspaceUser = membership;
    setRequestContext({ workspaceId: normalizedWorkspaceId, userId });

    return true;
  }
}