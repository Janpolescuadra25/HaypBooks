import { NextResponse } from 'next/server'
import { getRoleFromCookies, hasPermission } from '@/lib/rbac-server'
import { deriveRange } from '@/lib/report-helpers'

type IssueRow = {
  id: string
  number: string
  date: string
  issue: string
  line: number | null
  account: string
  debit: number
  credit: number
}


function generateIssues(asOfIso: string): IssueRow[] {
  // Deterministic set of 6 journals with various issues seeded by day-of-month
  const seed = Number(asOfIso.slice(-2)) || 15
  const day = (offset: number) => {
    const d = new Date(asOfIso + 'T00:00:00Z')
    d.setUTCDate(d.getUTCDate() - offset)
    return d.toISOString().slice(0, 10)
  }
  const rows: IssueRow[] = []
  const push = (r: IssueRow) => rows.push(r)
  // 1) Unbalanced totals
  push({ id: `je_${seed}1`, number: `JE-IB${100 + (seed % 9)}`, date: day(0), issue: 'Unbalanced totals (debits != credits)', line: null, account: '', debit: 120, credit: 100 })
  // 2) Line with both debit and credit
  push({ id: `je_${seed}2`, number: `JE-IB${110 + (seed % 9)}`, date: day(1), issue: 'Line has both debit and credit amounts', line: 2, account: '5000 · Cost of Goods Sold', debit: 75, credit: 10 })
  // 3) Missing account on a line
  push({ id: `je_${seed}3`, number: `JE-IB${120 + (seed % 9)}`, date: day(2), issue: 'Line is missing an account', line: 1, account: '', debit: 200, credit: 0 })
  // 4) Zero-amount line
  push({ id: `je_${seed}4`, number: `JE-IB${130 + (seed % 9)}`, date: day(3), issue: 'Line has zero amount (debit and credit are zero)', line: 3, account: '6100 · Rent Expense', debit: 0, credit: 0 })
  // 5) All zero journal
  push({ id: `je_${seed}5`, number: `JE-IB${140 + (seed % 9)}`, date: day(4), issue: 'Journal totals are zero', line: null, account: '', debit: 0, credit: 0 })
  // 6) Future-dated journal (warning)
  push({ id: `je_${seed}6`, number: `JE-IB${150 + (seed % 9)}`, date: day(-1), issue: 'Future-dated journal entry', line: null, account: '', debit: 0, credit: 0 })
  return rows
}

export async function GET(req: Request) {
  const role = getRoleFromCookies()
  if (!hasPermission(role, 'reports:read')) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  const url = new URL(req.url)
  const period = url.searchParams.get('period') || undefined
  let start = url.searchParams.get('start')
  let end = url.searchParams.get('end')
  const derived = deriveRange(period, start, end)
  start = derived.start || start
  end = derived.end || end

  const asOf = (end || new Date().toISOString().slice(0, 10))
  const rows = generateIssues(asOf)
  const total = rows.length

  return NextResponse.json({ rows, total, asOf, start: start || null, end: end || null })
}
