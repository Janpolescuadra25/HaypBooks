import { cookies } from 'next/headers'
import { ROLE_PERMISSIONS, type Role, type Permission } from './rbac-shared'
import { setRoleOverride as setUniversalOverride, getRoleOverride } from './rbac'

export function getRoleFromCookies(): Role {
  try {
    // In unit tests, allow an override injected via the universal module
    const override = getRoleOverride()
    if (override && ROLE_PERMISSIONS[override]) return override
    const role = cookies().get('role')?.value as Role | undefined
    return role && ROLE_PERMISSIONS[role] ? role : 'admin'
  } catch {
    return 'admin'
  }
}

export function getPermissionsForRole(role: Role): Permission[] { return ROLE_PERMISSIONS[role] || [] }
export function hasPermission(role: Role, perm: Permission): boolean { return getPermissionsForRole(role).includes(perm) }

export function requirePermission(role: Role, perm: Permission) { if (!hasPermission(role, perm)) throw new Error(`403 Forbidden: missing permission ${perm}`) }

export function setRoleCookie(role: Role) { try { cookies().set('role', role) } catch { /* ignore */ } }

// Expose test override wiring through universal module for consistency
export function setRoleOverride(role: Role | undefined) { setUniversalOverride(role) }
