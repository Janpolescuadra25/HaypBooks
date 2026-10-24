export enum PracticeUserRole {
  OWNER = 'OWNER',
  ADMIN = 'ADMIN',
  STAFF = 'STAFF',
}

export enum PracticeUserStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
}

export const VALID_PRACTICE_ROLES = Object.values(PracticeUserRole)
export const VALID_PRACTICE_STATUSES = Object.values(PracticeUserStatus)

export function isValidPracticeRole(role: string): role is PracticeUserRole {
  return VALID_PRACTICE_ROLES.includes(role as PracticeUserRole)
}

export function isValidPracticeStatus(status: string): status is PracticeUserStatus {
  return VALID_PRACTICE_STATUSES.includes(status as PracticeUserStatus)
}
