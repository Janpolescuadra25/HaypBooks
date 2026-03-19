import { SetMetadata } from '@nestjs/common'

export const ROLES_KEY = 'roles'

/**
 * Attach required role names to a route or controller.
 * Works in conjunction with RolesGuard.
 *
 * Usage:
 *   @Roles('Owner', 'Admin')
 *   @UseGuards(JwtAuthGuard, RolesGuard)
 *   @Get('sensitive-route')
 *   sensitiveRoute() { ... }
 */
export const Roles = (...roles: string[]) => SetMetadata(ROLES_KEY, roles)
