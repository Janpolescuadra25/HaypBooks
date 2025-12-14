export type Check = {
  id: string
  date: string // YYYY-MM-DD
  payee: string
  amount: number
  account: string // bank account identifier
  number: string // check number
  status: 'to_print' | 'printed' | 'void'
  memo?: string
  printedAt?: string | null
  voidedAt?: string | null
  voidMode?: 'flat' | 'reversal'
}

let CHECKS: Check[] = []
const NEXT_NO: Record<string, number> = {}

export function listChecks(): Check[] {
  return CHECKS.slice()
}

export function getCheck(id: string): Check | undefined {
  return CHECKS.find(c => c.id === id)
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

export function markPrinted(id: string, printedAtIso?: string): Check | undefined {
  const i = CHECKS.findIndex(x => x.id === id)
  if (i < 0) return undefined
  const d = (printedAtIso && printedAtIso.slice(0, 10)) || new Date().toISOString().slice(0, 10)
  const curr = CHECKS[i]
  if (curr.status === 'void') return curr // no-op if already void
  const updated: Check = { ...curr, status: 'printed', printedAt: d }
  CHECKS[i] = updated
  return updated
}

export function voidCheck(id: string, voidDateIso: string, mode: 'flat' | 'reversal' = 'flat'): Check | undefined {
  const i = CHECKS.findIndex(x => x.id === id)
  if (i < 0) return undefined
  const d = voidDateIso.slice(0, 10)
  const curr = CHECKS[i]
  const updated: Check = { ...curr, status: 'void', voidedAt: d, voidMode: mode }
  CHECKS[i] = updated
  return updated
}
