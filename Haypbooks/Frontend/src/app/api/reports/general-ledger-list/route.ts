import { NextResponse } from 'next/server'
import { getRoleFromCookies, hasPermission } from '@/lib/rbac-server'
import { deriveRange } from '@/lib/report-helpers'

type Row = {
  account: { number: string; name: string }
  beginning: number
  debits: number
  credits: number
  netChange: number
  ending: number
}

const ACCOUNTS = [
  { number: '1000', name: 'Cash' },
  { number: '1010', name: 'Accounts Receivable' },
  { number: '1200', name: 'Prepaid Expenses' },
  { number: '2000', name: 'Accounts Payable' },
  { number: '2100', name: 'Accrued Expenses' },
  { number: '3000', name: 'Owner’s Equity' },
  { number: '4000', name: 'Sales Revenue' },
  { number: '4010', name: 'Service Revenue' },
  { number: '5000', name: 'Cost of Goods Sold' },
  { number: '6100', name: 'Rent Expense' },
  { number: '6200', name: 'Utilities Expense' },
  { number: '6300', name: 'Payroll Expense' },
]


export async function GET(req: Request) {
  const role = getRoleFromCookies()
  if (!hasPermission(role, 'reports:read')) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  const url = new URL(req.url)
  const rawPeriod = url.searchParams.get('period') || undefined
  // Alias presets to MTD/QTD semantics for parity with core/ledger reports
  const period = rawPeriod === 'ThisMonth' ? 'MTD' : rawPeriod === 'ThisQuarter' ? 'QTD' : rawPeriod
  let start = url.searchParams.get('start')
  let end = url.searchParams.get('end')
  const derived = deriveRange(period, start, end)
  start = derived.start || start
  end = derived.end || end

  const asOf = (end ? new Date(end + 'T00:00:00Z') : new Date()).toISOString()

  // Deterministic numbers by account index and day-span
  const daySpan = start && end ? Math.max(1, Math.ceil((new Date(end + 'T00:00:00Z').getTime() - new Date(start + 'T00:00:00Z').getTime()) / 86400000) + 1) : 30

  const rows: Row[] = ACCOUNTS.map((a, idx) => {
    const begin = 1000 + idx * 250
    const debits = (idx + 1) * 300 + Math.floor(daySpan / 10) * 25
    const credits = (idx % 3) * 200 + Math.floor(daySpan / 12) * 20
    const net = debits - credits
    const ending = begin + net
    return { account: a, beginning: begin, debits, credits, netChange: net, ending }
  })

  // Totals row (can be computed on client, but provide here for parity with CSV)
  const totals = rows.reduce((acc, r) => {
    acc.beginning += r.beginning
    acc.debits += r.debits
    acc.credits += r.credits
    acc.netChange += r.netChange
    acc.ending += r.ending
    return acc
  }, { beginning: 0, debits: 0, credits: 0, netChange: 0, ending: 0 })

  return NextResponse.json({ rows, totals, asOf, start: start || null, end: end || null })
}
