import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { SYSTEM_ROLES_KEY } from '../decorators/system-roles.decorator'

@Injectable()
export class SystemRoleGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredSystemRoles = this.reflector.getAllAndOverride<string[]>(SYSTEM_ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ])

    if (!requiredSystemRoles || requiredSystemRoles.length === 0) {
      return true
    }

    const { user } = context.switchToHttp().getRequest()

    if (!user || !user.systemRole) {
      throw new ForbiddenException('System role required')
    }

    if (requiredSystemRoles.includes(user.systemRole)) {
      return true
    }

    throw new ForbiddenException('Insufficient system role permissions')
  }
}
