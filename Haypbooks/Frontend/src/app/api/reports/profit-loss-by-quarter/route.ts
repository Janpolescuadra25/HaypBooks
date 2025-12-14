import { NextResponse } from 'next/server'
import { getRoleFromCookies, hasPermission } from '@/lib/rbac-server'
import { deriveRange } from '@/lib/report-helpers'

type QuarterKey = `${number}-Q${1|2|3|4}`

function quarterKey(d: Date): QuarterKey {
  const q = Math.floor(d.getUTCMonth() / 3) + 1 as 1|2|3|4
  return `${d.getUTCFullYear()}-Q${q}`
}

function quarterRange(startIso: string, endIso: string): QuarterKey[] {
  const s = new Date(startIso + 'T00:00:00Z')
  const e = new Date(endIso + 'T00:00:00Z')
  if (isNaN(s.valueOf()) || isNaN(e.valueOf()) || s > e) return []
  const first = new Date(Date.UTC(s.getUTCFullYear(), Math.floor(s.getUTCMonth()/3)*3, 1))
  const last = new Date(Date.UTC(e.getUTCFullYear(), Math.floor(e.getUTCMonth()/3)*3, 1))
  const out: QuarterKey[] = []
  for (let d = first; d <= last; d = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + 3, 1))) {
    out.push(quarterKey(d))
  }
  return out
}

function quarterBounds(qk: QuarterKey): { start: Date; end: Date } {
  const [yStr, qStr] = qk.split('-Q')
  const y = parseInt(yStr, 10)
  const q = parseInt(qStr, 10) as 1|2|3|4
  const startMonth = (q - 1) * 3
  const start = new Date(Date.UTC(y, startMonth, 1))
  const end = new Date(Date.UTC(y, startMonth + 3, 0))
  return { start, end }
}

function daysOverlap(rangeStart: Date, rangeEnd: Date, winStart: Date, winEnd: Date): number {
  const s = rangeStart > winStart ? rangeStart : winStart
  const e = rangeEnd < winEnd ? rangeEnd : winEnd
  if (e < s) return 0
  return Math.floor((e.getTime() - s.getTime())/86400000) + 1
}

export async function GET(req: Request) {
  const role = getRoleFromCookies()
  if (!hasPermission(role, 'reports:read')) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  const url = new URL(req.url)
  const period = url.searchParams.get('period') || 'YTD'
  const qStart = url.searchParams.get('start')
  const qEnd = url.searchParams.get('end')
  // Preserve original semantics: treat ThisQuarter as QTD for this route
  const alias = period === 'ThisQuarter' ? 'QTD' : period
  const { start, end } = deriveRange(alias, qStart, qEnd) as { start: string; end: string }

  const quarters = quarterRange(start, end)

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
  for (const l of lines) values[l.key] = new Array(quarters.length).fill(0)

  const startD = new Date(start + 'T00:00:00Z')
  const endD = new Date(end + 'T00:00:00Z')

  quarters.forEach((qk, idx) => {
    const { start: qs, end: qe } = quarterBounds(qk)
    const overlap = daysOverlap(startD, endD, qs, qe)
    const share = overlap / baseYearDays
    if (share <= 0) return
    const rev = Math.round(annualRevenue * share)
    const cogs = Math.round(annualCogs * share)
    const exp = Math.round(annualExpenses * share)
    const oth = Math.round(annualOtherIncome * share)
    values['Revenue'][idx] = rev
    values['Cost of Goods Sold'][idx] = -cogs
    values['Operating Expenses'][idx] = -exp
    values['Other Income'][idx] = oth
    values['Gross Profit'][idx] = rev - cogs
    const opInc = (rev - cogs) - exp
    values['Operating Income'][idx] = opInc
    values['Net Income'][idx] = opInc + oth
  })

  const payload = {
    period,
    start,
    end,
    quarters,
    lines: lines.map((l) => ({ name: l.key, values: values[l.key] })),
  }

  return NextResponse.json(payload)
}
