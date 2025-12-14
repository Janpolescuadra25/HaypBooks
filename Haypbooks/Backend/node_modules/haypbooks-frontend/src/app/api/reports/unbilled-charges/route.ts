import { NextResponse } from 'next/server'
import { getRoleFromCookies, hasPermission } from '@/lib/rbac-server'
import { deriveRange } from '@/lib/report-helpers'

// Unbilled Charges = approved sales charges not yet invoiced
// Shape mirrors invoice-like lines but without invoice number
export type UnbilledChargeRow = {
  date: string
  customer: string
  productService: string
  description?: string
  qty: number
  rate: number
  amount: number
}

type Totals = { amount: number }

function generateRows(asOfIso: string, start?: string | null, end?: string | null): UnbilledChargeRow[] {
  const base = new Date((end || asOfIso) + 'T00:00:00Z')
  const day = (offset: number) => { const d = new Date(base); d.setUTCDate(d.getUTCDate() - offset); return d.toISOString().slice(0,10) }
  const rows: UnbilledChargeRow[] = [
    { date: day(5),  customer: 'Acme Co',  productService: 'Consulting', description: 'Implementation', qty: 5, rate: 120, amount: 600 },
    { date: day(10), customer: 'Globex',   productService: 'Subscription', description: 'Pro plan', qty: 1, rate: 350.25, amount: 350.25 },
    { date: day(2),  customer: 'Soylent',  productService: 'Design', description: 'Branding sprint', qty: 2, rate: 200, amount: 400 },
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
  const totals = rows.reduce((acc, r) => { acc.amount += r.amount; return acc }, { amount: 0 } as Totals)
  return NextResponse.json({ rows, totals, asOf: asOfIso, start: start || null, end: end || null, period: (period || null) })
}
