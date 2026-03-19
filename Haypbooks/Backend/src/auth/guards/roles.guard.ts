import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { ROLES_KEY } from '../decorators/roles.decorator'

/**
 * RolesGuard — checks that the authenticated user holds at least one of the
 * roles listed in the @Roles() decorator.
 *
 * The guard reads `user.role` (string, e.g. 'Owner') and `user.isOwner`
 * (boolean) from the request, which are both set by the JWT strategy after
 * token verification.
 *
 * If no @Roles() decorator is present on the route the guard returns true
 * immediately, so it is safe to apply globally or per-controller.
 *
 * Example:
 *   @UseGuards(JwtAuthGuard, RolesGuard)
 *   @Roles('Owner', 'Admin')
 *   @Delete(':id')
 *   remove(@Param('id') id: string) { ... }
 */
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ])

    // No @Roles() → open to any authenticated user
    if (!requiredRoles || requiredRoles.length === 0) return true

    const { user } = context.switchToHttp().getRequest()
    if (!user) return false

    // Workspace owners always pass role checks
    if (user.isOwner === true) return true

    return requiredRoles.includes(user.role)
  }
}
