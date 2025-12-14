import { NextResponse } from 'next/server'
import { getRoleFromCookies, hasPermission } from '@/lib/rbac-server'
import { deriveRange } from '@/lib/report-helpers'

type Row = {
  account: string
  budgeted: number
  actual: number
  variance: number
  variancePct: number
  prev?: {
    budgeted: number
    actual: number
    variance: number
    variancePct: number
  }
}

function generateRows(asOfIso: string, start?: string | null, end?: string | null): Row[] {
  const seed = Number(asOfIso.slice(-2)) || 15
  const rows: Row[] = [
    { account: 'Revenue', budgeted: 50000 + seed * 100, actual: 48000 + seed * 90, variance: 0, variancePct: 0 },
    { account: 'Cost of Goods Sold', budgeted: 25000 + seed * 50, actual: 26000 + seed * 55, variance: 0, variancePct: 0 },
    { account: 'Gross Profit', budgeted: 25000 + seed * 50, actual: 22000 + seed * 35, variance: 0, variancePct: 0 },
    { account: 'Operating Expenses', budgeted: 15000 + seed * 30, actual: 14000 + seed * 28, variance: 0, variancePct: 0 },
    { account: 'Net Income', budgeted: 10000 + seed * 20, actual: 8000 + seed * 7, variance: 0, variancePct: 0 },
  ]
  rows.forEach(r => {
    r.variance = r.actual - r.budgeted
    r.variancePct = r.budgeted !== 0 ? (r.variance / r.budgeted) * 100 : 0
  })
  return rows
}

export async function GET(req: Request) {
  const role = getRoleFromCookies()
  if (!hasPermission(role, 'reports:read')) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const url = new URL(req.url)
  const period = url.searchParams.get('period') || undefined
  const qStart = url.searchParams.get('start')
  const qEnd = url.searchParams.get('end')
  const { start, end } = deriveRange(qStart && qEnd ? 'Custom' : period, qStart, qEnd)
  const compare = url.searchParams.get('compare') === '1'

  const asOfIso = end || new Date().toISOString().slice(0, 10)
  const rows = generateRows(asOfIso, start, end)
  if (compare) {
    // Generate a previous period approximation by scaling current values deterministically
    rows.forEach(r => {
      const prevBudgeted = Math.round(r.budgeted * 0.98)
      const prevActual = Math.round(r.actual * 0.97)
      const prevVariance = prevActual - prevBudgeted
      const prevVariancePct = prevBudgeted !== 0 ? (prevVariance / prevBudgeted) * 100 : 0
      r.prev = { budgeted: prevBudgeted, actual: prevActual, variance: prevVariance, variancePct: prevVariancePct }
    })
  }
  const totals = rows.reduce((acc, r) => {
    acc.budgeted += r.budgeted
    acc.actual += r.actual
    acc.variance += r.variance
    return acc
  }, { budgeted: 0, actual: 0, variance: 0, variancePct: 0 })
  totals.variancePct = totals.budgeted !== 0 ? (totals.variance / totals.budgeted) * 100 : 0
  const totalsPrev = compare ? rows.reduce((acc, r) => {
    if (r.prev) {
      acc.budgeted += r.prev.budgeted
      acc.actual += r.prev.actual
      acc.variance += r.prev.variance
    }
    return acc
  }, { budgeted: 0, actual: 0, variance: 0, variancePct: 0 }) : undefined
  if (totalsPrev) {
    totalsPrev.variancePct = totalsPrev.budgeted !== 0 ? (totalsPrev.variance / totalsPrev.budgeted) * 100 : 0
  }

  return NextResponse.json({ rows, totals, prevTotals: totalsPrev || null, asOf: asOfIso, start: start || null, end: end || null, period: (period || null) })
}