import { NextResponse } from 'next/server'
import { getRoleFromCookies, hasPermission } from '@/lib/rbac-server'
import { deriveRange } from '@/lib/report-helpers'

type Row = { date: string; type: string; number: string; customer: string; memo: string; amount: number }

function generateRows(asOfIso: string, start?: string | null, end?: string | null): Row[] {
  const base = new Date((end || asOfIso) + 'T00:00:00Z')
  const day = (offset: number) => { const d = new Date(base); d.setUTCDate(d.getUTCDate() - offset); return d.toISOString().slice(0,10) }
  const seed = Number(asOfIso.slice(-2)) || 12
  const rows: Row[] = [
    { date: day(45), type: 'Invoice', number: `INV-${1000 + (seed % 37)}`, customer: 'Customer A', memo: 'Website design', amount: 600.00 },
    { date: day(33), type: 'Invoice', number: `INV-${1005 + (seed % 37)}`, customer: 'Customer A', memo: 'Hosting annual', amount: 500.00 },
    { date: day(22), type: 'Payment', number: `PMT-${4000 + (seed % 37)}`, customer: 'Customer A', memo: 'Partial payment', amount: -80.00 },
    { date: day(19), type: 'Invoice', number: `INV-${1101 + (seed % 37)}`, customer: 'Customer B', memo: 'Consulting', amount: 250.25 },
    { date: day(11), type: 'Payment', number: `PMT-${4010 + (seed % 37)}`, customer: 'Customer B', memo: 'Payment received', amount: -60.00 },
    { date: day(6), type: 'Invoice', number: `INV-${2003 + (seed % 37)}`, customer: 'Customer C', memo: 'Training', amount: 75.75 },
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
  const customer = url.searchParams.get('customer') || undefined
  let start = url.searchParams.get('start')
  let end = url.searchParams.get('end')
  const derived = deriveRange(period, start, end)
  start = derived.start || start
  end = derived.end || end

  const asOfIso = end || new Date().toISOString().slice(0, 10)
  let rows = generateRows(asOfIso, start, end)
  if (customer) rows = rows.filter(r => r.customer === customer)
  const totals = rows.reduce((acc, r) => { acc.amount += r.amount; return acc }, { amount: 0 })
  return NextResponse.json({ rows, totals, asOf: asOfIso, start: start || null, end: end || null, period: (period || null) })
}
