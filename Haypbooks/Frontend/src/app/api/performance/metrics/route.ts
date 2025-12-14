import { NextResponse } from 'next/server'
import { deriveRange } from '@/lib/report-helpers'
import { shortMonthFromIso } from '@/lib/date'

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

function toShortMonthLabel(monthIso: string): string {
  return shortMonthFromIso(monthIso)
}

function extendSeries(base: number[], length: number): number[] {
  if (length <= base.length) return base.slice(base.length - length)
  const out = base.slice()
  const avgDelta = base.length > 1 ? (base[base.length - 1] - base[0]) / (base.length - 1) : 0
  const round2 = (n: number) => Math.round(n * 100) / 100
  for (let i = base.length; i < length; i++) {
    const next = out[out.length - 1] + avgDelta
    out.push(round2(next))
  }
  return out
}

export async function GET(req: Request) {
  // Mock metrics for the Performance Center with period filtering
  const url = new URL(req.url)
  const period = url.searchParams.get('period')
  const qStart = url.searchParams.get('start')
  const qEnd = url.searchParams.get('end')
  const compare = url.searchParams.get('compare') === '1'
  const { start, end } = deriveRange(period, qStart, qEnd)

  // Base 12-month seed trends
  const seedMonths = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
  const seedRevenue = [82, 90, 88, 96, 104, 108, 112, 119, 121, 128, 130, 135]
  const seedGm = [58, 62, 61, 65, 68, 70, 72, 74, 75, 77, 78, 80]
  const seedCash = [210, 205, 220, 235, 240, 250, 262, 270, 280, 295, 305, 315]
  const seedMrr = [25, 26, 26.5, 27.5, 28, 28.5, 29.5, 30.5, 31, 31.5, 32, 33]
  const seedChurn = [3.2, 3.0, 2.9, 3.1, 2.8, 2.7, 2.6, 2.5, 2.6, 2.4, 2.3, 2.2]
  const seedArDays = [39, 40, 38, 37, 36, 35, 34, 33, 34, 33, 32, 31]
  const seedApDays = [27, 26, 25, 26, 25, 24, 24, 23, 24, 23, 22, 22]

  // If no derived range (e.g., invalid), fall back to seeds
  if (!start || !end) {
    const base = {
      months: seedMonths,
      revenue: seedRevenue,
      grossMargin: seedGm,
      cash: seedCash,
      mrr: seedMrr,
      churn: seedChurn,
      arDays: seedArDays,
      apDays: seedApDays,
    }
    if (!compare) return NextResponse.json(base)
    const round2 = (n: number) => Math.round(n * 100) / 100
    const prev = {
      revenue: seedRevenue.map(v => round2(v * 0.95)),
      grossMargin: seedGm.map(v => round2(v * 0.96)),
      cash: seedCash.map(v => round2(v * 0.97)),
      mrr: seedMrr.map(v => round2(v * 0.97)),
      churn: seedChurn.map(v => round2(v * 1.08)),
      arDays: seedArDays.map(v => round2(v * 1.05)),
      apDays: seedApDays.map(v => round2(v * 1.05)),
    }
    return NextResponse.json({ ...base, prev })
  }

  const monthKeys = monthRange(start, end)
  const months = monthKeys.map(toShortMonthLabel)
  const n = months.length || 12

  const revenue = extendSeries(seedRevenue, n)
  const gm = extendSeries(seedGm, n)
  const cash = extendSeries(seedCash, n)
  const mrr = extendSeries(seedMrr, n)
  const churn = extendSeries(seedChurn, n)
  const arDays = extendSeries(seedArDays, n)
  const apDays = extendSeries(seedApDays, n)

  if (!compare) return NextResponse.json({ months, revenue, grossMargin: gm, cash, mrr, churn, arDays, apDays })
  const round2 = (n: number) => Math.round(n * 100) / 100
  const prev = {
    revenue: revenue.map(v => round2(v * 0.95)),
    grossMargin: gm.map(v => round2(v * 0.96)),
    cash: cash.map(v => round2(v * 0.97)),
    mrr: mrr.map(v => round2(v * 0.97)),
    churn: churn.map(v => round2(v * 1.08)),
    arDays: arDays.map(v => round2(v * 1.05)),
    apDays: apDays.map(v => round2(v * 1.05)),
  }
  return NextResponse.json({ months, revenue, grossMargin: gm, cash, mrr, churn, arDays, apDays, prev })
}
