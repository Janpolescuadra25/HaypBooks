import { NextResponse } from 'next/server'
import { getRoleFromCookies, hasPermission } from '@/lib/rbac-server'

function computePeriodRange(period?: string | null, start?: string | null, end?: string | null) {
  let s = start || ''
  let e = end || ''
  const now = new Date()
  const today = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()))
  const iso = (d: Date) => d.toISOString().slice(0,10)
  if (!s || !e) {
    const p = period || 'YTD'
    const deriveStartFor = (preset: string, endIso: string) => {
      if (preset === 'MTD' || preset === 'ThisMonth') return iso(new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), 1)))
      if (preset === 'QTD' || preset === 'ThisQuarter') return iso(new Date(Date.UTC(today.getUTCFullYear(), Math.floor(today.getUTCMonth() / 3) * 3, 1)))
      if (preset === 'YTD') return iso(new Date(Date.UTC(today.getUTCFullYear(), 0, 1)))
      if (preset === 'Last12') return iso(new Date(new Date(endIso + 'T00:00:00Z').getTime() - 364 * 86400000))
      if (preset === 'LastMonth') {
        const eDate = new Date(endIso + 'T00:00:00Z')
        return iso(new Date(Date.UTC(eDate.getUTCFullYear(), eDate.getUTCMonth(), 1)))
      }
      if (preset === 'LastQuarter') {
        const eDate = new Date(endIso + 'T00:00:00Z')
        return iso(new Date(Date.UTC(eDate.getUTCFullYear(), Math.floor(eDate.getUTCMonth() / 3) * 3, 1)))
      }
      return s
    }
    const deriveEndFor = (preset: string) => {
      if (preset === 'MTD' || preset === 'ThisMonth' || preset === 'QTD' || preset === 'ThisQuarter' || preset === 'YTD' || preset === 'Last12') return iso(today)
      if (preset === 'LastMonth') {
        const firstThisMonth = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), 1))
        return iso(new Date(firstThisMonth.getTime() - 86400000))
      }
      if (preset === 'LastQuarter') {
        const q = Math.floor(today.getUTCMonth() / 3)
        const startQ = new Date(Date.UTC(today.getUTCFullYear(), q * 3, 1))
        return iso(new Date(startQ.getTime() - 86400000))
      }
      return e
    }
    if (!s && e) {
      s = deriveStartFor(p, e)
    } else if (s && !e) {
      e = deriveEndFor(p)
    } else if (!s && !e) {
      // derive both
      e = deriveEndFor(p)
      s = deriveStartFor(p, e)
    }
  }
  return { start: s, end: e }
}

function daysInRange(s?: string | null, e?: string | null): number | null {
  if (!s || !e) return null
  const sd = new Date(s + 'T00:00:00Z')
  const ed = new Date(e + 'T00:00:00Z')
  if (isNaN(sd.valueOf()) || isNaN(ed.valueOf())) return null
  const ms = ed.getTime() - sd.getTime()
  if (ms < 0) return null
  return Math.floor(ms / 86400000) + 1
}

export async function GET(req: Request) {
  const role = getRoleFromCookies()
  if (!hasPermission(role, 'reports:read')) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  const url = new URL(req.url)
  const period = url.searchParams.get('period') || 'YTD'
  let start = url.searchParams.get('start')
  let end = url.searchParams.get('end')
  const range = computePeriodRange(period, start, end)
  start = range.start
  end = range.end

  // Mock retained earnings calculation
  const dayCount = daysInRange(start, end)
  const baseYearDays = 365
  const scale = dayCount ? Math.max(1, dayCount) / baseYearDays : 1
  const beginning = 200000 // prior accumulated earnings (mock)
  const netIncome = Math.round(120000 * scale) // reuse P&L style scale
  const dividends = Math.round(30000 * scale) // distributions/draws
  const ending = beginning + netIncome - dividends

  const asOf = (end || new Date().toISOString().slice(0,10))
  return NextResponse.json({ period, start, end, asOf, beginning, netIncome, dividends, ending })
}
