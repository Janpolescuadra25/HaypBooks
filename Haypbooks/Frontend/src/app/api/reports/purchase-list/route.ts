import { NextResponse } from 'next/server'
import { getRoleFromCookies, hasPermission } from '@/lib/rbac-server'
import { deriveRange } from '@/lib/report-helpers'

type Row = { date: string; type: string; number: string; vendor: string; account: string; memo: string; amount: number }

function generateRows(asOfIso: string, start?: string | null, end?: string | null): Row[] {
  const seed = Number(asOfIso.slice(-2)) || 33
  const day = (offset: number) => {
    const d = new Date((end || asOfIso) + 'T00:00:00Z')
    d.setUTCDate(d.getUTCDate() - offset)
    return d.toISOString().slice(0, 10)
  }
  const rows: Row[] = [
    { date: day(0), type: 'Bill', number: `B-${4000 + (seed % 50)}`, vendor: 'Vendor A', account: 'Accounts Payable', memo: 'Office supplies', amount: -210.45 },
    { date: day(1), type: 'Expense', number: `E-${3000 + (seed % 50)}`, vendor: 'Vendor B', account: 'Utilities', memo: 'Electricity', amount: -125.00 },
    { date: day(2), type: 'Check', number: `CHK-${5000 + (seed % 50)}`, vendor: 'Vendor C', account: 'Checking', memo: 'Maintenance', amount: -95.85 },
    { date: day(3), type: 'Vendor Credit', number: `VC-${2000 + (seed % 50)}`, vendor: 'Vendor A', account: 'Accounts Payable', memo: 'Return', amount: 45.00 },
  ]
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
  const totals = rows.reduce((acc, r) => { acc.amount += r.amount; return acc }, { amount: 0 })
  return NextResponse.json({ rows, totals, asOf: asOfIso, start: start || null, end: end || null, period: (period || null) })
}
