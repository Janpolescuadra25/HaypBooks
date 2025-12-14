import { NextResponse } from 'next/server'
import { getRoleFromCookies, hasPermission } from '@/lib/rbac-server'
import { deriveRange } from '@/lib/report-helpers'

type Row = { date: string; type: string; number: string; vendor: string; memo: string; amount: number }


function generateRows(asOfIso: string, start?: string | null, end?: string | null): Row[] {
  const seed = Number(asOfIso.slice(-2)) || 15
  const day = (offset: number) => {
    const d = new Date((end || asOfIso) + 'T00:00:00Z')
    d.setUTCDate(d.getUTCDate() - offset)
    return d.toISOString().slice(0, 10)
  }
  const rows: Row[] = [
    { date: day(0), type: 'Bill', number: `BILL-${2000 + (seed % 50)}`, vendor: 'Vendor A', memo: 'Supplies', amount: -800 },
    { date: day(1), type: 'Bill Payment', number: `BP-${5000 + (seed % 50)}`, vendor: 'Vendor A', memo: 'Payment', amount: 800 },
    { date: day(2), type: 'Bill', number: `BILL-${2100 + (seed % 50)}`, vendor: 'Vendor B', memo: 'Services', amount: -450 },
    { date: day(3), type: 'Vendor Credit', number: `VC-${2200 + (seed % 50)}`, vendor: 'Vendor B', memo: 'Refund', amount: 100 },
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
  // Group totals by vendor
  const byVendor: Record<string, { amount: number }> = {}
  for (const r of rows) {
    byVendor[r.vendor] = byVendor[r.vendor] || { amount: 0 }
    byVendor[r.vendor].amount += r.amount
  }
  const totals = { amount: rows.reduce((a, r) => a + r.amount, 0) }
  return NextResponse.json({ rows, byVendor, totals, asOf: asOfIso, start: start || null, end: end || null, period: (period || null) })
}
