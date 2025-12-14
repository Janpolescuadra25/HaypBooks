import { NextResponse } from 'next/server'
import { getRoleFromCookies, hasPermission } from '@/lib/rbac-server'
import { deriveRange } from '@/lib/report-helpers'

type Row = {
  agency: string
  rateName: string
  ratePct: number
  taxable: number
  nontaxable: number
  taxAmount: number
}

function generateRows(asOfIso: string): Row[] {
  const seed = Number(asOfIso.slice(-2)) || 15
  const base = 15000 + (seed % 9) * 400
  const non = 2500 + (seed % 6) * 200
  const rates = [
    { agency: 'State Tax Agency', rateName: 'Standard', ratePct: 7.25 },
    { agency: 'County Tax Agency', rateName: 'County', ratePct: 1.00 },
    { agency: 'City Tax Agency', rateName: 'Local', ratePct: 2.50 },
  ]
  return rates.map((r, i) => {
    const frac = 0.5 + (i * 0.25)
    const taxable = Math.round(base * frac / rates.length)
    const nontaxable = Math.round(non * frac / rates.length)
    const taxAmount = Math.round(taxable * (r.ratePct / 100) * 100) / 100
    return { agency: r.agency, rateName: r.rateName, ratePct: r.ratePct, taxable, nontaxable, taxAmount }
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
  const rows = generateRows(asOfIso)
  const totals = rows.reduce((acc, r) => {
    acc.taxable += r.taxable
    acc.nontaxable += r.nontaxable
    acc.taxAmount += r.taxAmount
    return acc
  }, { taxable: 0, nontaxable: 0, taxAmount: 0 })

  return NextResponse.json({ rows, totals, asOf: asOfIso, start: start || null, end: end || null, period: (period || null) })
}
