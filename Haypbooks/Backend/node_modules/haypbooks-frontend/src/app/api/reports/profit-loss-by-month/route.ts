import { NextResponse } from 'next/server'
import { getRoleFromCookies, hasPermission } from '@/lib/rbac-server'
import { deriveRange } from '@/lib/report-helpers'

function monthKey(d: Date): string { return `${d.getUTCFullYear()}-${String(d.getUTCMonth()+1).padStart(2,'0')}` }

function monthRange(startIso: string, endIso: string): string[] {
  const s = new Date(startIso + 'T00:00:00Z')
  const e = new Date(endIso + 'T00:00:00Z')
  if (isNaN(s.valueOf()) || isNaN(e.valueOf()) || s > e) return []
  const first = new Date(Date.UTC(s.getUTCFullYear(), s.getUTCMonth(), 1))
  const last = new Date(Date.UTC(e.getUTCFullYear(), e.getUTCMonth(), 1))
  const out: string[] = []
  for (let d = first; d <= last; d = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth()+1, 1))) {
    out.push(monthKey(d))
  }
  return out
}

function daysOverlapInMonth(monthIso: string, startIso: string, endIso: string): number {
  // monthIso is YYYY-MM for month start
  const [y, m] = monthIso.split('-').map((n) => parseInt(n, 10))
  const monthStart = new Date(Date.UTC(y, (m-1), 1))
  const monthEnd = new Date(Date.UTC(y, (m-1)+1, 0))
  const s = new Date(startIso + 'T00:00:00Z')
  const e = new Date(endIso + 'T00:00:00Z')
  if (isNaN(s.valueOf()) || isNaN(e.valueOf())) return 0
  const start = s > monthStart ? s : monthStart
  const end = e < monthEnd ? e : monthEnd
  if (end < start) return 0
  const days = Math.floor((end.getTime() - start.getTime())/86400000) + 1
  return Math.max(0, days)
}

function daysInMonth(monthIso: string): number {
  const [y, m] = monthIso.split('-').map((n) => parseInt(n, 10))
  const end = new Date(Date.UTC(y, (m-1)+1, 0))
  return end.getUTCDate()
}

export async function GET(req: Request) {
  const role = getRoleFromCookies()
  if (!hasPermission(role, 'reports:read')) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  const url = new URL(req.url)
  const period = url.searchParams.get('period') || 'YTD'
  const qStart = url.searchParams.get('start')
  const qEnd = url.searchParams.get('end')
  // Preserve original semantics: treat ThisMonth as MTD and ThisQuarter as QTD for this route
  const alias = period === 'ThisMonth' ? 'MTD' : period === 'ThisQuarter' ? 'QTD' : period
  const { start, end } = deriveRange(alias, qStart, qEnd) as { start: string; end: string }

  const months = monthRange(start, end)

  // base annualized mock values aligned with profit-loss route
  const baseYearDays = 365
  const annualRevenue = 125000
  const annualCogs = 48000
  const annualExpenses = 38000
  const annualOtherIncome = 2500

  const lines = [
    { key: 'Revenue', sign: +1, base: annualRevenue },
    { key: 'Cost of Goods Sold', sign: -1, base: annualCogs },
    { key: 'Gross Profit', sign: +1, derived: true },
    { key: 'Operating Expenses', sign: -1, base: annualExpenses },
    { key: 'Operating Income', sign: +1, derived: true },
    { key: 'Other Income', sign: +1, base: annualOtherIncome },
    { key: 'Net Income', sign: +1, derived: true },
  ] as const

  const values: Record<string, number[]> = {}
  for (const l of lines) values[l.key] = new Array(months.length).fill(0)

  // Distribute base numbers into months proportionally to overlap days
  months.forEach((mk, idx) => {
    const overlap = daysOverlapInMonth(mk, start, end)
    const dim = daysInMonth(mk)
    const monthShare = overlap / baseYearDays // share of year within range for this month
    if (monthShare <= 0) return
    // concrete values for non-derived lines
    const rev = Math.round(annualRevenue * monthShare)
    const cogs = Math.round(annualCogs * monthShare)
    const exp = Math.round(annualExpenses * monthShare)
    const oth = Math.round(annualOtherIncome * monthShare)
    values['Revenue'][idx] = rev
    values['Cost of Goods Sold'][idx] = -cogs
    values['Operating Expenses'][idx] = -exp
    values['Other Income'][idx] = oth
    // derived lines
    values['Gross Profit'][idx] = rev - cogs
    const opInc = (rev - cogs) - exp
    values['Operating Income'][idx] = opInc
    values['Net Income'][idx] = opInc + oth
  })

  const payload = {
    period,
    start,
    end,
    months,
    lines: lines.map((l) => ({ name: l.key, values: values[l.key] })),
  }

  return NextResponse.json(payload)
}
