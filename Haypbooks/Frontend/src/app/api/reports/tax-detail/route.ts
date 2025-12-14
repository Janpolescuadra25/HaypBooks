import { NextResponse } from 'next/server'
import { getRoleFromCookies, hasPermission } from '@/lib/rbac-server'
import { deriveRange } from '@/lib/report-helpers'

type Row = {
  date: string
  doc: string
  customer: string
  agency: string
  rateName: string
  ratePct: number
  taxable: number
  taxAmount: number
}

function generateRows(asOfIso: string, start?: string | null, end?: string | null): Row[] {
  const seed = Number(asOfIso.slice(-2)) || 15
  const endIso = (end || asOfIso)
  const mkDate = (offset: number) => {
    const d = new Date(endIso + 'T00:00:00Z')
    d.setUTCDate(d.getUTCDate() - offset)
    return d.toISOString().slice(0,10)
  }
  const rows: Row[] = [
    { date: mkDate(0), doc: `INV-${1000 + (seed % 90)}`, customer: 'Customer A', agency: 'State Tax Agency', rateName: 'Standard', ratePct: 7.25, taxable: 1200, taxAmount: Math.round(1200*0.0725*100)/100 },
    { date: mkDate(1), doc: `INV-${1001 + (seed % 90)}`, customer: 'Customer B', agency: 'City Tax Agency', rateName: 'Local', ratePct: 2.50, taxable: 700, taxAmount: Math.round(700*0.025*100)/100 },
    { date: mkDate(2), doc: `INV-${1002 + (seed % 90)}`, customer: 'Customer C', agency: 'County Tax Agency', rateName: 'County', ratePct: 1.00, taxable: 950, taxAmount: Math.round(950*0.01*100)/100 },
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
  const qStart = url.searchParams.get('start')
  const qEnd = url.searchParams.get('end')
  const { start, end } = deriveRange(qStart && qEnd ? 'Custom' : period, qStart, qEnd)

  const asOfIso = end || new Date().toISOString().slice(0, 10)
  const rows = generateRows(asOfIso, start, end)
  const totals = rows.reduce((acc, r) => {
    acc.taxable += r.taxable
    acc.taxAmount += r.taxAmount
    return acc
  }, { taxable: 0, taxAmount: 0 })

  return NextResponse.json({ rows, totals, asOf: asOfIso, start: start || null, end: end || null, period: (period || null) })
}
