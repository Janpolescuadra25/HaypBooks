import { NextResponse } from 'next/server'
import { getRoleFromCookies, hasPermission } from '@/lib/rbac-server'
import { deriveRange } from '@/lib/report-helpers'

type Row = { date: string; type: string; number: string; customer: string; memo: string; amount: number }

function generateRows(asOfIso: string, start?: string | null, end?: string | null): Row[] {
  const seed = Number(asOfIso.slice(-2)) || 15
  const day = (offset: number) => {
    const d = new Date((end || asOfIso) + 'T00:00:00Z')
    d.setUTCDate(d.getUTCDate() - offset)
    return d.toISOString().slice(0, 10)
  }
  const rows: Row[] = [
    { date: day(0), type: 'Invoice', number: `INV-${1000 + (seed % 50)}`, customer: 'Customer A', memo: 'Consulting', amount: 1200 },
    { date: day(1), type: 'Sales Receipt', number: `SR-${4000 + (seed % 50)}`, customer: 'Customer A', memo: 'Payment', amount: -500 },
    { date: day(2), type: 'Invoice', number: `INV-${1100 + (seed % 50)}`, customer: 'Customer B', memo: 'Support', amount: 450 },
    { date: day(3), type: 'Credit Memo', number: `CM-${1200 + (seed % 50)}`, customer: 'Customer B', memo: 'Refund', amount: -100 },
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
  // Group totals by customer
  const byCustomer: Record<string, { amount: number }> = {}
  for (const r of rows) {
    byCustomer[r.customer] = byCustomer[r.customer] || { amount: 0 }
    byCustomer[r.customer].amount += r.amount
  }
  const totals = { amount: rows.reduce((a, r) => a + r.amount, 0) }
  return NextResponse.json({ rows, byCustomer, totals, asOf: asOfIso, start: start || null, end: end || null, period: (period || null) })
}
