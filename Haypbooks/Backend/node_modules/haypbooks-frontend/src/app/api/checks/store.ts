// In-memory check store for mock API usage
export interface Check {
  id: string
  date: string
  payee: string
  amount: number
  account: string
  number: number
  status: string
  memo?: string
}

const checks: Check[] = []
const sequenceByAccount: Record<string, number> = {}

export function nextCheckNumber(account: string): number {
  const next = (sequenceByAccount[account] ?? 1000) + 1
  sequenceByAccount[account] = next
  return next
}

export function upsertCheck(check: Check): Check {
  const idx = checks.findIndex((c) => c.id === check.id)
  if (idx >= 0) {
    checks[idx] = check
  } else {
    checks.push(check)
  }
  return check
}

export function listChecks(): Check[] {
  return checks
}
