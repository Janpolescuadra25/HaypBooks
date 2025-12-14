import type { Role } from '@/lib/rbac-shared'

// Utility to mock server RBAC module consistently across tests.
// Provides setRole() to simulate cookie-derived role in API route handlers.
export function mockServerRBAC() {
  // Lazy require to avoid hoist issues in Jest
  const modPath = '@/lib/rbac-server'
  const original = jest.requireActual<any>(modPath)
  let currentRole: Role | undefined

  jest.doMock(modPath, () => {
    return {
      ...original,
      getRoleFromCookies: () => (currentRole ?? 'admin'),
      setRoleOverride: (role?: Role) => { currentRole = role },
    }
  })

  return {
    setRole(role: Role | undefined) { currentRole = role },
    reset() { currentRole = undefined },
  }
}
