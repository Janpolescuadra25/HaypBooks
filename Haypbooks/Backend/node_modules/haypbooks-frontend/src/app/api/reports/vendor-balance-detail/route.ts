import { NextResponse } from 'next/server'
import { getRoleFromCookies, hasPermission } from '@/lib/rbac-server'
import { deriveRange } from '@/lib/report-helpers'

type Row = { date: string; type: string; number: string; vendor: string; memo: string; amount: number }

function generateRows(asOfIso: string, start?: string | null, end?: string | null): Row[] {
  const base = new Date((end || asOfIso) + 'T00:00:00Z')
  const day = (offset: number) => { const d = new Date(base); d.setUTCDate(d.getUTCDate() - offset); return d.toISOString().slice(0,10) }
  const seed = Number(asOfIso.slice(-2)) || 12
  const rows: Row[] = [
    { date: day(40), type: 'Bill', number: `BILL-${2000 + (seed % 37)}`, vendor: 'Vendor A', memo: 'Office supplies', amount: 250.00 },
    { date: day(32), type: 'Bill', number: `BILL-${2005 + (seed % 37)}`, vendor: 'Vendor A', memo: 'Software subscription', amount: 145.50 },
    { date: day(20), type: 'Bill Payment', number: `BP-${5000 + (seed % 37)}`, vendor: 'Vendor A', memo: 'Partial payment', amount: -100.00 },
    { date: day(18), type: 'Bill', number: `BILL-${2101 + (seed % 37)}`, vendor: 'Vendor B', memo: 'Hosting', amount: 120.00 },
    { date: day(10), type: 'Bill Payment', number: `BP-${5010 + (seed % 37)}`, vendor: 'Vendor B', memo: 'Payment', amount: -60.00 },
    { date: day(5), type: 'Bill', number: `BILL-${3003 + (seed % 37)}`, vendor: 'Vendor C', memo: 'Repairs', amount: 98.25 },
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
  const vendor = url.searchParams.get('vendor') || undefined
  let start = url.searchParams.get('start')
  let end = url.searchParams.get('end')
  const derived = deriveRange(period, start, end)
  start = derived.start || start
  end = derived.end || end

  const asOfIso = end || new Date().toISOString().slice(0, 10)
  let rows = generateRows(asOfIso, start, end)
  if (vendor) rows = rows.filter(r => r.vendor === vendor)
  const totals = rows.reduce((acc, r) => { acc.amount += r.amount; return acc }, { amount: 0 })
  return NextResponse.json({ rows, totals, asOf: asOfIso, start: start || null, end: end || null, period: (period || null) })
}
