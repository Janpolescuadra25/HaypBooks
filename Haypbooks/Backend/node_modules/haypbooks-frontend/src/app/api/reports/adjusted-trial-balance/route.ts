import { NextResponse } from 'next/server'
import { computeAdjustedTrialBalance } from '@/mock/aggregations'
import { getRoleFromCookies, hasPermission } from '@/lib/rbac-server'
import { deriveRange } from '@/lib/report-helpers'
import '@/mock/seed'

export async function GET(req: Request) {
  const role = getRoleFromCookies?.()
  if (hasPermission && !hasPermission(role, 'reports:read')) return new NextResponse('Forbidden', { status: 403 })
  const url = new URL(req.url)
  const period = url.searchParams.get('period') || 'YTD'
  const startQ = url.searchParams.get('start') || undefined
  const endQ = url.searchParams.get('end') || undefined
  // Align semantics to core statements: ThisMonth->MTD, ThisQuarter->QTD
  const alias = period === 'ThisMonth' ? 'MTD' : period === 'ThisQuarter' ? 'QTD' : period
  const dr = deriveRange(alias, startQ, endQ)
  const start = dr.start || startQ
  const end = dr.end || endQ
  const tb = computeAdjustedTrialBalance({ start: start || undefined, end: end || undefined })
  return NextResponse.json({
    period,
    start: start || null,
    end: end || null,
    asOf: (end ? new Date(end + 'T00:00:00Z') : new Date()).toISOString().slice(0,10),
    rows: tb.rows,
    totals: tb.totals,
    balanced: tb.balanced,
  })
}
