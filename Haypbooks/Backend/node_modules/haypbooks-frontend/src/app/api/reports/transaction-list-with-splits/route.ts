import { NextResponse } from 'next/server'
import { getRoleFromCookies, hasPermission } from '@/lib/rbac-server'
import { deriveRange } from '@/lib/report-helpers'

type Row = {
  txnId: string
  date: string
  type: string
  number: string
  payee: string
  memo: string
  splitAccount: string
  debit: number
  credit: number
}

const ACCOUNTS = [
  { number: '1000', name: 'Cash' },
  { number: '1010', name: 'Accounts Receivable' },
  { number: '1200', name: 'Prepaid Expenses' },
  { number: '2000', name: 'Accounts Payable' },
  { number: '2100', name: 'Accrued Expenses' },
  { number: '4000', name: 'Sales Revenue' },
  { number: '5000', name: 'Cost of Goods Sold' },
  { number: '6100', name: 'Rent Expense' },
]


function generateRows(asOfIso: string, start?: string | null, end?: string | null): Row[] {
  // Deterministic pseudo dataset seeded by asOf day-of-month
  const seed = Number(asOfIso.slice(-2)) || 15
  const day = (offset: number) => {
    const d = new Date((end || asOfIso) + 'T00:00:00Z')
    d.setUTCDate(d.getUTCDate() - offset)
    return d.toISOString().slice(0, 10)
  }
  const rows: Row[] = []
  // Build 4 transactions with 2-3 splits each
  const txns = [
    { type: 'Invoice', baseNo: 1000 + (seed % 50), payee: 'Customer A', memo: 'Web design services', splits: [
      { acct: '4000 · Sales Revenue', debit: 0, credit: 1200 },
      { acct: '1010 · Accounts Receivable', debit: 1200, credit: 0 },
    ]},
    { type: 'Bill', baseNo: 2000 + (seed % 50), payee: 'Vendor B', memo: 'Hosting subscription', splits: [
      { acct: '6100 · Rent Expense', debit: 0, credit: 0 }, // placeholder to vary
      { acct: '5000 · Cost of Goods Sold', debit: 300, credit: 0 },
      { acct: '2000 · Accounts Payable', debit: 0, credit: 300 },
    ]},
    { type: 'Journal Entry', baseNo: 3000 + (seed % 50), payee: '', memo: 'Reclass entry', splits: [
      { acct: '1200 · Prepaid Expenses', debit: 250, credit: 0 },
      { acct: '6100 · Rent Expense', debit: 0, credit: 250 },
    ]},
    { type: 'Receipt', baseNo: 4000 + (seed % 50), payee: 'Customer C', memo: 'Partial payment', splits: [
      { acct: '1000 · Cash', debit: 500, credit: 0 },
      { acct: '1010 · Accounts Receivable', debit: 0, credit: 500 },
    ]},
  ]

  txns.forEach((t, i) => {
    const txnId = `${t.type.slice(0,2).toLowerCase()}_${t.baseNo}`
    const date = day(i)
    const number = `${t.type === 'Journal Entry' ? 'JE' : t.type === 'Bill' ? 'B' : t.type === 'Receipt' ? 'RC' : 'INV'}-${t.baseNo}`
    t.splits.forEach((s, j) => {
      // add slight deterministic variation
      const debit = s.debit + ((i + j + seed) % 2 === 0 ? 0 : 0)
      const credit = s.credit + ((i + j + seed) % 2 === 1 ? 0 : 0)
      rows.push({
        txnId,
        date,
        type: t.type,
        number,
        payee: t.payee,
        memo: t.memo,
        splitAccount: s.acct,
        debit,
        credit,
      })
    })
  })

  // Filter by range if provided
  const startIso = start || null
  const endIso = end || null
  return rows.filter(r => {
    if (startIso && r.date < startIso) return false
    if (endIso && r.date > endIso) return false
    return true
  })
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

  const asOfIso = end || new Date().toISOString().slice(0, 10)
  const rows = generateRows(asOfIso, start, end)
    // Stable deterministic ordering: date asc, then txnId, then splitAccount
    .sort((a, b) => {
      const d = a.date.localeCompare(b.date)
      if (d !== 0) return d
      const t = (a.txnId || '').localeCompare(b.txnId || '')
      if (t !== 0) return t
      return (a.splitAccount || '').localeCompare(b.splitAccount || '')
    })
  const totals = rows.reduce((acc, r) => { acc.debit += r.debit; acc.credit += r.credit; return acc }, { debit: 0, credit: 0 })

  return NextResponse.json({ rows, totals, asOf: asOfIso, start: start || null, end: end || null, period: (period || null) })
}
