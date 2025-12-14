export type Role = 'admin' | 'manager' | 'ap-clerk' | 'viewer' | 'no-reports'

export type Permission =
  | 'bills:read'
  | 'bills:write'
  | 'bills:approve'
  | 'invoices:read'
  | 'invoices:write'
  | 'statements:send'
  | 'collections:send'
  | 'journal:read'
  | 'journal:write'
  | 'reports:read'
  | 'customers:read'
  | 'customers:write'
  | 'vendors:read'
  | 'vendors:write'
  | 'audit:read'
  | 'audit:write'
  | 'settings:write'
  | 'settings:close-period'

export const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  admin: ['bills:read','bills:write','bills:approve','invoices:read','invoices:write','statements:send','collections:send','journal:read','journal:write','reports:read','customers:read','customers:write','vendors:read','vendors:write','audit:read','audit:write','settings:write','settings:close-period'],
  manager: ['bills:read','bills:write','bills:approve','invoices:read','invoices:write','statements:send','collections:send','journal:read','journal:write','reports:read','customers:read','customers:write','vendors:read','vendors:write','audit:read','settings:write'],
  'ap-clerk': ['bills:read','bills:write','reports:read','invoices:read','journal:read','customers:read','vendors:read','vendors:write'],
  viewer: ['bills:read','invoices:read','journal:read','reports:read','customers:read','vendors:read'],
  'no-reports': ['bills:read','invoices:read','journal:read','customers:read','vendors:read']
}

export function getPermissionsForRole(role: Role): Permission[] {
  return ROLE_PERMISSIONS[role] || []
}

export function hasPermission(role: Role, perm: Permission): boolean {
  return getPermissionsForRole(role).includes(perm)
}
