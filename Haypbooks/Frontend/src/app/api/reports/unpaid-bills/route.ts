import { NextResponse } from 'next/server'
import { getRoleFromCookies, hasPermission } from '@/lib/rbac-server'
import { deriveRange } from '@/lib/report-helpers'

type Row = { vendor: string; number: string; billDate: string; dueDate: string; terms: string; amountDue: number }


function generateRows(asOfIso: string, start?: string | null, end?: string | null): Row[] {
  const base = new Date((end || asOfIso) + 'T00:00:00Z')
  const day = (offset: number) => { const d = new Date(base); d.setUTCDate(d.getUTCDate() - offset); return d.toISOString().slice(0,10) }
  const rows: Row[] = [
    { vendor: 'Vendor A', number: 'BILL-1001', billDate: day(35), dueDate: day(5),  terms: 'Net 30', amountDue: 420.00 },
    { vendor: 'Vendor A', number: 'BILL-1020', billDate: day(12), dueDate: day( -3), terms: 'Due on receipt', amountDue: 125.50 },
    { vendor: 'Vendor B', number: 'BILL-2007', billDate: day(62), dueDate: day(32), terms: 'Net 30', amountDue: 310.75 },
    { vendor: 'Vendor C', number: 'BILL-3003', billDate: day(8),  dueDate: day( -2), terms: 'Net 15', amountDue: 98.25 },
  ]
  const sIso = start || null
  const eIso = end || null
  return rows.filter(r => {
    // Filter by billDate within range when provided
    if (sIso && r.billDate < sIso) return false
    if (eIso && r.billDate > eIso) return false
    // Only include unpaid amounts with dueDate <= as-of
    if (r.dueDate > asOfIso) return false
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
  const totals = rows.reduce((a, r) => { a.amountDue += r.amountDue; return a }, { amountDue: 0 })
  return NextResponse.json({ rows, totals, asOf: asOfIso, start: start || null, end: end || null, period: (period || null) })
}
