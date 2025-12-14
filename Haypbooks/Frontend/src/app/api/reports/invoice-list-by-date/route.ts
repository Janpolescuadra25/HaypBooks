import { NextResponse } from 'next/server'
import { getRoleFromCookies, hasPermission } from '@/lib/rbac-server'
import { deriveRange } from '@/lib/report-helpers'

type Row = { date: string; number: string; customer: string; memo: string; amount: number; openBalance: number }

function generateRows(asOfIso: string, start?: string | null, end?: string | null): Row[] {
  const seed = Number(asOfIso.slice(-2)) || 15
  const day = (offset: number) => {
    const d = new Date((end || asOfIso) + 'T00:00:00Z')
    d.setUTCDate(d.getUTCDate() - offset)
    return d.toISOString().slice(0, 10)
  }
  // Deterministic invoice amounts
  const base = 800 + (seed % 200)
  const rows: Row[] = [
    { date: day(0), number: `INV-${1000 + (seed % 90)}`, customer: 'Customer A', memo: 'Website redesign', amount: base + 400, openBalance: (base + 400) - 300 },
    { date: day(1), number: `INV-${1001 + (seed % 90)}`, customer: 'Customer B', memo: 'Implementation', amount: base + 200, openBalance: (base + 200) - 0 },
    { date: day(2), number: `INV-${1002 + (seed % 90)}`, customer: 'Customer C', memo: 'Support retainer', amount: base + 50, openBalance: (base + 50) - 50 },
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
  const totals = rows.reduce((acc, r) => { acc.amount += r.amount; acc.openBalance += r.openBalance; return acc }, { amount: 0, openBalance: 0 })
  return NextResponse.json({ rows, totals, asOf: asOfIso, start: start || null, end: end || null, period: (period || null) })
}
