export type Check = {
  id: string
  date: string // YYYY-MM-DD
  payee: string
  amount: number
  account: string // bank account name/identifier
  number: string // check number
  status: 'to_print' | 'printed' | 'void'
  memo?: string
}

let CHECKS: Check[] = []
const NEXT_NO: Record<string, number> = {}

export function listChecks(): Check[] {
  return CHECKS.slice()
}

export function findByAccountAndNumber(account: string, number: string): Check | undefined {
  return CHECKS.find(c => c.account === account && c.number === number)
}

export function nextCheckNumber(account: string): string {
  const base = NEXT_NO[account] ?? 1000
  const next = base + 1
  NEXT_NO[account] = next
  return String(next)
}

export function upsertCheck(c: Check): Check {
  const i = CHECKS.findIndex(x => x.id === c.id)
  if (i >= 0) CHECKS[i] = c
  else CHECKS.unshift(c)
  // Track next number per account when the provided number is numeric
  const n = parseInt(c.number, 10)
  if (!Number.isNaN(n)) {
    NEXT_NO[c.account] = Math.max(NEXT_NO[c.account] ?? 1000, n)
  }
  return c
}

export function voidCheck(id: string): void {
  const i = CHECKS.findIndex(x => x.id === id)
  if (i >= 0) CHECKS[i] = { ...CHECKS[i], status: 'void' }
}
