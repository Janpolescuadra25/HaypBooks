import { NextResponse } from 'next/server'
import { getRoleFromCookies, hasPermission } from '@/lib/rbac-server'
import { deriveRange } from '@/lib/report-helpers'

type Row = { date: string; employee: string; customer: string; service: string; description?: string; hours: number; rate: number; amount: number }

function generateRows(asOfIso: string, start?: string | null, end?: string | null): Row[] {
  const base = new Date((end || asOfIso) + 'T00:00:00Z')
  const day = (offset: number) => { const d = new Date(base); d.setUTCDate(d.getUTCDate() - offset); return d.toISOString().slice(0,10) }
  const rows: Row[] = [
    { date: day(3), employee: 'Alice Johnson', customer: 'Acme Co', service: 'Consulting', description: 'Sprint planning', hours: 3.5, rate: 120, amount: 420 },
    { date: day(7), employee: 'Bob Smith',     customer: 'Globex',  service: 'Design',     description: 'Wireframes',     hours: 5,   rate: 95,  amount: 475 },
    { date: day(1), employee: 'Alice Johnson', customer: 'Soylent', service: 'Research',   description: 'User interviews', hours: 2,   rate: 120, amount: 240 },
  ]
  const sIso = start || null
  const eIso = end || null
  return rows.filter(r => {
    if (sIso && r.date < sIso) return false
    if (eIso && r.date > eIso) return false
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
  const totals = rows.reduce((acc, r) => { acc.hours += r.hours; acc.amount += r.amount; return acc }, { hours: 0, amount: 0 })
  return NextResponse.json({ rows, totals, asOf: asOfIso, start: start || null, end: end || null, period: (period || null) })
}
