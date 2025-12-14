import { NextResponse } from 'next/server'
import { getRoleFromCookies, hasPermission } from '@/lib/rbac-server'
import { deriveRange } from '@/lib/report-helpers'

export type Row = { customer: string; openBalance: number }

function generateRows(asOfIso: string, start?: string | null, end?: string | null): Row[] {
  // Deterministic demo data; in a real system we would aggregate customer open balances
  // as of the end date (or today when not provided) filtered by invoice dates within range.
  const rows: Row[] = [
    { customer: 'Customer A', openBalance: 1020.0 },
    { customer: 'Customer B', openBalance: 250.25 },
    { customer: 'Customer C', openBalance: 75.75 },
  ]
  return rows
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
  const totals = rows.reduce((a, r) => { a.openBalance += r.openBalance; return a }, { openBalance: 0 })
  return NextResponse.json({ rows, totals, asOf: asOfIso, start: start || null, end: end || null, period: (period || null) })
}
