import { NextResponse } from 'next/server'
import { getRoleFromCookies, hasPermission } from '@/lib/rbac-server'
import { deriveRange } from '@/lib/report-helpers'

type Account = { number: string; name: string; type: 'Asset' | 'Liability' | 'Equity' | 'Revenue' | 'Expense' }
type Row = { account: Account; opening: number; netChange: number; balance: number }

const ACCOUNTS: Account[] = [
  { number: '1000', name: 'Cash', type: 'Asset' },
  { number: '1010', name: 'Accounts Receivable', type: 'Asset' },
  { number: '1200', name: 'Prepaid Expenses', type: 'Asset' },
  { number: '2000', name: 'Accounts Payable', type: 'Liability' },
  { number: '2100', name: 'Accrued Expenses', type: 'Liability' },
  { number: '3000', name: 'Owner’s Equity', type: 'Equity' },
  { number: '4000', name: 'Sales Revenue', type: 'Revenue' },
  { number: '4010', name: 'Service Revenue', type: 'Revenue' },
  { number: '5000', name: 'Cost of Goods Sold', type: 'Expense' },
  { number: '6100', name: 'Rent Expense', type: 'Expense' },
  { number: '6200', name: 'Utilities Expense', type: 'Expense' },
  { number: '6300', name: 'Payroll Expense', type: 'Expense' },
]


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

  const asOf = (end ? new Date(end + 'T00:00:00Z') : new Date()).toISOString()

  // Deterministic balances by account index and day-span
  const daySpan = start && end ? Math.max(1, Math.ceil((new Date(end + 'T00:00:00Z').getTime() - new Date(start + 'T00:00:00Z').getTime()) / 86400000) + 1) : 30

  const rows: Row[] = ACCOUNTS.map((a, idx) => {
    const opening = 500 + idx * 125
    const netChange = (idx + 1) * 100 + Math.floor(daySpan / 15) * 15 - (idx % 2) * 40
    const balance = opening + netChange
    return { account: a, opening, netChange, balance }
  })

  const totals = rows.reduce((acc, r) => { acc.opening += r.opening; acc.netChange += r.netChange; acc.balance += r.balance; return acc }, { opening: 0, netChange: 0, balance: 0 })

  return NextResponse.json({ rows, totals, asOf, start: start || null, end: end || null })
}
