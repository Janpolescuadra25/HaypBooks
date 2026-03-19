/**
 * Permission helpers — thin wrappers over the existing RBAC logic.
 * Re-exports shared RBAC utilities and adds convenience checkers.
 */
export * from './rbac-shared'

/** Returns true when the user has ALL of the supplied permissions. */
export function hasAll(userPerms: string[], required: string[]): boolean {
  return required.every((p) => userPerms.includes(p))
}

/** Returns true when the user has AT LEAST ONE of the supplied permissions. */
export function hasAny(userPerms: string[], allowed: string[]): boolean {
  return allowed.some((p) => userPerms.includes(p))
}
