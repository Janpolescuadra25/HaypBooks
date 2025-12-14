import { NextResponse } from 'next/server'
import { getRoleFromCookies, hasPermission } from '@/lib/rbac-server'
import { deriveRange as deriveRangeShared } from '@/lib/report-helpers'

type Row = { date: string; type: string; number: string; vendor: string; memo: string; amount: number }

const deriveRange = deriveRangeShared

function generateRows(asOfIso: string, start?: string | null, end?: string | null): Row[] {
  const base = new Date((end || asOfIso) + 'T00:00:00Z')
  const day = (offset: number) => { const d = new Date(base); d.setUTCDate(d.getUTCDate() - offset); return d.toISOString().slice(0,10) }
  const seed = Number(asOfIso.slice(-2)) || 11
  const rows: Row[] = [
    { date: day(25), type: 'Bill Payment', number: `BP-${4000 + (seed % 50)}`, vendor: 'Vendor A', memo: 'ACH payment', amount: -200.00 },
    { date: day(19), type: 'Bill Payment', number: `BP-${4020 + (seed % 50)}`, vendor: 'Vendor B', memo: 'Check #105', amount: -60.00 },
    { date: day(10), type: 'Bill Payment', number: `BP-${4100 + (seed % 50)}`, vendor: 'Vendor A', memo: 'Card payment', amount: -75.50 },
    { date: day(5), type: 'Bill Payment', number: `BP-${4200 + (seed % 50)}`, vendor: 'Vendor C', memo: 'Wire transfer', amount: -98.25 },
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
