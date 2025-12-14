import { NextResponse } from 'next/server'
import { deriveRange } from '@/lib/report-helpers'
import { getRoleFromCookies, hasPermission } from '@/lib/rbac-server'
import { db } from '@/mock/db'
import { computeAdjustedTrialBalance } from '@/mock/aggregations'
import '@/mock/seed'

function todayIso() { return new Date().toISOString().slice(0,10) }

export async function GET(req: Request) {
  // RBAC: financial reports require reports:read
  const role = getRoleFromCookies()
  if (!hasPermission(role, 'reports:read')) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const url = new URL(req.url)
  const period = url.searchParams.get('period') || 'YTD'
  const alias = period === 'ThisMonth' ? 'MTD' : period === 'ThisQuarter' ? 'QTD' : period
  const startQ = url.searchParams.get('start') || undefined
  const endQ = url.searchParams.get('end') || undefined
  const dr = deriveRange(alias, startQ, endQ)
  const start = dr.start || startQ || null
  const end = dr.end || endQ || null
  const asOf = end || todayIso()

  const result = computeAdjustedTrialBalance({ start: start || undefined, end: end || undefined })

  const payload = {
    period,
    start,
    end,
    asOf,
    rows: result.rows,
    totals: result.totals,
    balanced: result.balanced,
    accountingMethod: db.settings?.accountingMethod || 'accrual',
    baseCurrency: db.settings?.baseCurrency || 'USD',
    generatedAt: new Date().toISOString(),
  }
  return NextResponse.json(payload)
}
