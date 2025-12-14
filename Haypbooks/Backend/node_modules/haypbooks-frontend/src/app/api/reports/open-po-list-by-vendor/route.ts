import { NextResponse } from 'next/server'
import { getRoleFromCookies, hasPermission } from '@/lib/rbac-server'
import { deriveRange } from '@/lib/report-helpers'

type Row = { vendor: string; number: string; date: string; item: string; qtyOrdered: number; qtyReceived: number; qtyOpen: number; rate: number; amountOpen: number }

function generateRows(asOfIso: string, start?: string | null, end?: string | null): Row[] {
  const day = (offset: number) => {
    const d = new Date((end || asOfIso) + 'T00:00:00Z')
    d.setUTCDate(d.getUTCDate() - offset)
    return d.toISOString().slice(0, 10)
  }
  const rows: Row[] = [
    { vendor: 'Vendor A', number: 'PO-1001', date: day(2), item: 'Paper', qtyOrdered: 20, qtyReceived: 5, qtyOpen: 15, rate: 5, amountOpen: 75 },
    { vendor: 'Vendor A', number: 'PO-1002', date: day(1), item: 'Ink', qtyOrdered: 6, qtyReceived: 1, qtyOpen: 5, rate: 35, amountOpen: 175 },
    { vendor: 'Vendor B', number: 'PO-2003', date: day(0), item: 'Hosting', qtyOrdered: 1, qtyReceived: 0, qtyOpen: 1, rate: 120, amountOpen: 120 },
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
  const totals = rows.reduce((a, r) => {
    a.qtyOrdered += r.qtyOrdered
    a.qtyReceived += r.qtyReceived
    a.qtyOpen += r.qtyOpen
    a.amountOpen += r.amountOpen
    return a
  }, { qtyOrdered: 0, qtyReceived: 0, qtyOpen: 0, amountOpen: 0 })
  return NextResponse.json({ rows, totals, asOf: asOfIso, start: start || null, end: end || null, period: (period || null) })
}
