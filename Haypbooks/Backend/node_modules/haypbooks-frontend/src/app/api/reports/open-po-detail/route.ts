import { NextResponse } from 'next/server'
import { getRoleFromCookies, hasPermission } from '@/lib/rbac-server'
import { deriveRange } from '@/lib/report-helpers'

type Row = { date: string; type: string; number: string; vendor: string; item: string; qtyOrdered: number; qtyReceived: number; qtyOpen: number; rate: number; amountOpen: number }

function generateRows(asOfIso: string, start?: string | null, end?: string | null): Row[] {
  const seed = Number(asOfIso.slice(-2)) || 10
  const day = (offset: number) => {
    const d = new Date((end || asOfIso) + 'T00:00:00Z')
    d.setUTCDate(d.getUTCDate() - offset)
    return d.toISOString().slice(0, 10)
  }
  const base: Row[] = [
    { date: day(0), type: 'Purchase Order', number: `PO-${1000 + (seed % 50)}`, vendor: 'Vendor A', item: 'Paper', qtyOrdered: 50, qtyReceived: 20, qtyOpen: 30, rate: 5, amountOpen: 150 },
    { date: day(2), type: 'Purchase Order', number: `PO-${1001 + (seed % 50)}`, vendor: 'Vendor B', item: 'Ink', qtyOrdered: 10, qtyReceived: 0, qtyOpen: 10, rate: 35, amountOpen: 350 },
    { date: day(5), type: 'Purchase Order', number: `PO-${1010 + (seed % 50)}`, vendor: 'Vendor C', item: 'Hardware', qtyOrdered: 5, qtyReceived: 3, qtyOpen: 2, rate: 200, amountOpen: 400 },
  ]
  const sIso = start || null
  const eIso = end || null
  return base.filter(r => {
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
  const totals = rows.reduce((acc, r) => {
    acc.qtyOrdered += r.qtyOrdered
    acc.qtyReceived += r.qtyReceived
    acc.qtyOpen += r.qtyOpen
    acc.amountOpen += r.amountOpen
    return acc
  }, { qtyOrdered: 0, qtyReceived: 0, qtyOpen: 0, amountOpen: 0 })
  return NextResponse.json({ rows, totals, asOf: asOfIso, start: start || null, end: end || null, period: (period || null) })
}
