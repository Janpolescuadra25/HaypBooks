import { NextResponse } from 'next/server'
import { getRoleFromCookies, hasPermission } from '@/lib/rbac-server'
import { deriveRange } from '@/lib/report-helpers'

type Row = {
  account: { number: string; name: string }
  date: string
  memo: string
  debit: number
  credit: number
}

const ACCOUNTS = [
  { number: '1000', name: 'Cash' },
  { number: '1010', name: 'Accounts Receivable' },
  { number: '1200', name: 'Prepaid Expenses' },
  { number: '1100', name: 'Inventory' },
  { number: '2000', name: 'Accounts Payable' },
  { number: '2200', name: 'Credit Card' },
  { number: '2100', name: 'Accrued Expenses' },
  { number: '3000', name: 'Owner’s Equity' },
  { number: '3100', name: 'Retained Earnings' },
  { number: '4000', name: 'Sales Revenue' },
  { number: '5000', name: 'Cost of Goods Sold' },
]


export async function GET(req: Request) {
  const role = getRoleFromCookies()
  if (!hasPermission(role, 'reports:read')) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  const url = new URL(req.url)
  const period = url.searchParams.get('period') || undefined
  let start = url.searchParams.get('start')
  let end = url.searchParams.get('end')
  const accountParam = url.searchParams.getAll('account').filter(Boolean)
  const accountList = accountParam.length ? Array.from(new Set(accountParam.flatMap((s) => s.split(',').map((x) => x.trim()).filter(Boolean)))) : []
  const allowedAccounts = accountList.length ? ACCOUNTS.filter((a) => accountList.includes(a.number)) : ACCOUNTS
  const derived = deriveRange(period, start, end)
  start = derived.start || start
  end = derived.end || end

  const asOf = (end ? new Date(end + 'T00:00:00Z') : new Date()).toISOString()

  // Deterministic rows per account per day within the range
  const rows: Row[] = []
  const effectiveStart = start || new Date().toISOString().slice(0, 10)
  const effectiveEnd = end || effectiveStart
  const s = new Date(effectiveStart + 'T00:00:00Z')
  const e = new Date(effectiveEnd + 'T00:00:00Z')
  const days = Math.max(1, Math.ceil((e.getTime() - s.getTime()) / 86400000) + 1)

  for (let di = 0; di < Math.min(days, 14); di++) {
    const d = new Date(s.getTime() + di * 86400000)
    const isoDay = d.toISOString().slice(0, 10)
    for (let ai = 0; ai < allowedAccounts.length; ai++) {
      const a = allowedAccounts[ai]
      const debit = (di % 2 === 0 && ai % 2 === 0) ? 100 + ai * 10 + di * 5 : 0
      const credit = (di % 2 === 1 && ai % 2 === 1) ? 80 + ai * 8 + di * 4 : 0
      rows.push({ account: a, date: isoDay, memo: `Txn ${di + 1}-${ai + 1}`, debit, credit })
    }
  }

  const totals = rows.reduce((acc, r) => { acc.debit += r.debit; acc.credit += r.credit; return acc }, { debit: 0, credit: 0 })

  return NextResponse.json({ rows, totals, asOf, start: start || null, end: end || null })
}
