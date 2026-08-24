import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { PrismaService } from '../repositories/prisma/prisma.service'

const WORKSPACE_TYPES_KEY = 'workspace-types'

@Injectable()
export class WorkspaceTypeGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredTypes = this.reflector.getAllAndOverride<string[]>(WORKSPACE_TYPES_KEY, [
      context.getHandler(),
      context.getClass(),
    ])

    if (!requiredTypes || requiredTypes.length === 0) return true

    const request = context.switchToHttp().getRequest()
    const user = request.user

    if (!user) return false
    if (user.systemRole === 'SUPER_ADMIN') return true

    const workspace = await this.prisma.workspace.findUnique({
      where: { ownerUserId: user.userId },
      select: { type: true },
    })

    if (!workspace) {
      throw new ForbiddenException('No workspace found for this user.')
    }

    if (requiredTypes.includes(workspace.type)) {
      return true
    }

    throw new ForbiddenException(`This action requires a ${requiredTypes.join(' or ')} workspace.`)
  }
}
