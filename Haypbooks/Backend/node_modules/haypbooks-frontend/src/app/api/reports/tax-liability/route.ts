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
  // Deterministic mock based on day digits to keep stable but varied
  const seed = Number(asOfIso.slice(-2)) || 15
  const base = 10000 + (seed % 7) * 500 // 10,000 .. 13,000 taxable base
  const non = 2000 + (seed % 5) * 250   // 2,000 .. 3,000 non-taxable
  const agencyA = 'State Tax Agency'
  const agencyB = 'City Tax Agency'
  const rateA = 7.25
  const rateB = 2.50
  const taxableA = Math.round(base * 0.7)
  const taxableB = base - taxableA
  const nontaxA = Math.round(non * 0.6)
  const nontaxB = non - nontaxA
  const taxA = Math.round(taxableA * (rateA / 100) * 100) / 100
  const taxB = Math.round(taxableB * (rateB / 100) * 100) / 100
  return [
    { agency: agencyA, rateName: 'Standard', ratePct: rateA, taxable: taxableA, nontaxable: nontaxA, taxAmount: taxA },
    { agency: agencyB, rateName: 'Local', ratePct: rateB, taxable: taxableB, nontaxable: nontaxB, taxAmount: taxB },
  ]
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
