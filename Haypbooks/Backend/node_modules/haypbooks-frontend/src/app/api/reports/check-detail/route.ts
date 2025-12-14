import { NextResponse } from 'next/server'
import { getRoleFromCookies, hasPermission } from '@/lib/rbac-server'
import { deriveRange } from '@/lib/report-helpers'

type Row = {
  date: string
  number: string
  payee: string
  account: string
  memo: string
  amount: number
}


function generateRows(asOfIso: string, start?: string | null, end?: string | null): Row[] {
  const seed = Number(asOfIso.slice(-2)) || 21
  const day = (offset: number) => {
    const d = new Date((end || asOfIso) + 'T00:00:00Z')
    d.setUTCDate(d.getUTCDate() - offset)
    return d.toISOString().slice(0, 10)
  }
  const rows: Row[] = [
    { date: day(0), number: `CHK-${5000 + (seed % 40)}`, payee: 'Vendor A', account: 'Checking', memo: 'Office supplies', amount: -85.25 },
    { date: day(1), number: `CHK-${5001 + (seed % 40)}`, payee: 'Vendor B', account: 'Checking', memo: 'Utilities', amount: -120.00 },
    { date: day(2), number: `CHK-${5002 + (seed % 40)}`, payee: 'Vendor C', account: 'Checking', memo: 'Fuel', amount: -45.80 },
    { date: day(3), number: `CHK-${5003 + (seed % 40)}`, payee: 'Contractor D', account: 'Checking', memo: 'Services', amount: -300.00 },
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
  const totals = rows.reduce((acc, r) => { acc.amount += r.amount; return acc }, { amount: 0 })
  return NextResponse.json({ rows, totals, asOf: asOfIso, start: start || null, end: end || null, period: (period || null) })
}
