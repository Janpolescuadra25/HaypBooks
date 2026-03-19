import { CanActivate, ExecutionContext, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from '../../repositories/prisma/prisma.service'
import { setRequestContext } from '../../shared/async-context'

/**
 * Enforces that the authenticated user has access to the company specified
 * in the `:companyId` route parameter.
 *
 * The guard verifies that:
 *  1. A company with the given ID exists.
 *  2. The company belongs to a workspace where the requesting user is an
 *     ACTIVE member (WorkspaceUser relationship).
 *
 * Apply after JwtAuthGuard so that req.user is already populated:
 *   @UseGuards(JwtAuthGuard, CompanyAccessGuard)
 */
@Injectable()
export class CompanyAccessGuard implements CanActivate {
  constructor(private readonly prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest()
    const companyId: string | undefined = request.params?.companyId
    const userId: string | undefined = request.user?.userId || request.user?.id

    if (!companyId) {
      // No companyId param on this route — guard is a no-op, let the handler decide
      return true
    }

    if (!userId) {
      throw new ForbiddenException('Authenticated user required')
    }

    // Verify the company exists first so we can give a clear 404 vs 403
    const company = await this.prisma.company.findUnique({
      where: { id: companyId },
      select: { id: true, workspaceId: true },
    })
    if (!company) throw new NotFoundException('Company not found')

    // Verify the user is an active member of the workspace that owns this company
    const member = await this.prisma.workspaceUser.findFirst({
      where: {
        userId,
        status: 'ACTIVE',
        workspaceId: company.workspaceId,
      },
    })
    if (!member) throw new ForbiddenException('Access denied to this company')

    // Attach the resolved workspaceId onto the request for downstream use
    request.companyWorkspaceId = company.workspaceId

    // Ensure async request context is populated for downstream DB session variable setting
    setRequestContext({ companyId, workspaceId: company.workspaceId, userId })

    return true
  }
}
