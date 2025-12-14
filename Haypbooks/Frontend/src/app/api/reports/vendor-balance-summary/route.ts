import { NextResponse } from 'next/server'
import { getRoleFromCookies, hasPermission } from '@/lib/rbac-server'
import { deriveRange } from '@/lib/report-helpers'

export type Row = { vendor: string; openBalance: number }

function generateRows(asOfIso: string, start?: string | null, end?: string | null): Row[] {
  // Deterministic demo data; in a real system we would aggregate vendor open balances
  // as of the end date (or today when not provided) filtered by bill dates within range.
  const rows: Row[] = [
    { vendor: 'Vendor A', openBalance: 545.5 },
    { vendor: 'Vendor B', openBalance: 310.75 },
    { vendor: 'Vendor C', openBalance: 98.25 },
  ]
  // Keep rows where balance date would be within range; for summary we just return all
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
