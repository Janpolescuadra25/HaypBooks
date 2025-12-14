import { NextResponse } from 'next/server'
import { getRoleFromCookies, hasPermission } from '@/lib/rbac-server'
import { deriveRange } from '@/lib/report-helpers'

type Row = { date: string; type: string; number: string; name: string; memo: string; debit: number; credit: number }


function generateRows(asOfIso: string, start?: string | null, end?: string | null): Row[] {
  const seed = Number(asOfIso.slice(-2)) || 15
  const day = (offset: number) => {
    const d = new Date((end || asOfIso) + 'T00:00:00Z')
    d.setUTCDate(d.getUTCDate() - offset)
    return d.toISOString().slice(0, 10)
  }
  const rows: Row[] = []
  const txns = [
    { type: 'Invoice', baseNo: 1000 + (seed % 50), name: 'Customer A', memo: 'Consulting', debit: 1500, credit: 0 },
    { type: 'Receipt', baseNo: 4000 + (seed % 50), name: 'Customer A', memo: 'Payment', debit: 0, credit: 500 },
    { type: 'Bill', baseNo: 2000 + (seed % 50), name: 'Vendor B', memo: 'Supplies', debit: 0, credit: 300 },
    { type: 'Expense', baseNo: 2100 + (seed % 50), name: 'Vendor C', memo: 'Meals', debit: 0, credit: 75 },
    { type: 'Deposit', baseNo: 1100 + (seed % 50), name: 'Bank', memo: 'Owner injection', debit: 1000, credit: 0 },
  ]
  txns.forEach((t, i) => {
    rows.push({ date: day(i), type: t.type, number: `${t.type === 'Invoice'?'INV':t.type==='Receipt'?'RC':t.type==='Bill'?'B':t.type==='Expense'?'E':'D'}-${t.baseNo}`, name: t.name, memo: t.memo, debit: t.debit, credit: t.credit })
  })
  const sIso = start || null
  const eIso = end || null
  return rows.filter(r => {
    if (sIso && r.date < sIso) return false
    if (eIso && r.date > eIso) return false
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
  const totals = rows.reduce((acc, r) => { acc.debit += r.debit; acc.credit += r.credit; return acc }, { debit: 0, credit: 0 })
  return NextResponse.json({ rows, totals, asOf: asOfIso, start: start || null, end: end || null, period: (period || null) })
}
