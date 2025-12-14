import { ROLE_PERMISSIONS, type Role, type Permission } from './rbac-shared'

// NOTE: This universal (isomorphic) module is CLIENT SAFE. Server route handlers and server components
// that need cookie-based role resolution should import './rbac-server'. This file intentionally avoids
// importing 'next/headers' so it can be bundled into the browser (used by mock API & client utilities).

let roleOverride: Role | undefined

export function setRoleOverride(role: Role | undefined) { roleOverride = role }
export function getRoleOverride(): Role | undefined { return roleOverride }

export function getRoleFromCookies(): Role {
  if (roleOverride && ROLE_PERMISSIONS[roleOverride]) return roleOverride
  if (typeof window === 'undefined') {
    // Server import not used here to stay client-safe; default to admin for universal contexts.
    return 'admin'
  }
  try {
    const cookie = document.cookie || ''
    const match = cookie.split(';').map(c=>c.trim()).find(c=>c.startsWith('role='))
    if (match) {
      const val = decodeURIComponent(match.split('=')[1]) as Role
      if (ROLE_PERMISSIONS[val]) return val
    }
  } catch { /* ignore */ }
  return 'admin'
}

export function getPermissionsForRole(role: Role): Permission[] { return ROLE_PERMISSIONS[role] || [] }
export function hasPermission(role: Role, perm: Permission): boolean { return getPermissionsForRole(role).includes(perm) }

export function setRoleCookie(role: Role) {
  if (typeof window !== 'undefined') {
    const d = new Date(); d.setFullYear(d.getFullYear() + 1)
    document.cookie = `role=${encodeURIComponent(role)}; path=/; expires=${d.toUTCString()}`
  }
}

export function requirePermission(role: Role, perm: Permission) { if (!hasPermission(role, perm)) throw new Error(`403 Forbidden: missing permission ${perm}`) }
