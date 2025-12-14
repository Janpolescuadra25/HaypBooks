import { NextResponse } from 'next/server'
import { buildCsvCaption } from '@/lib/report-helpers'
import { buildCsvFilename, parseCsvVersionFlag } from '@/lib/csv'
import { GET as getJson } from '../route'

type Row = { account: string; budgeted: number; actual: number; variance: number; variancePct: number; prev?: { budgeted: number; actual: number; variance: number; variancePct: number } }

function toCSV(rows: string[][]) {
  return rows.map(r => r.map((c) => {
    if (c == null) return ''
    const s = String(c)
    if (s.includes(',') || s.includes('"') || s.includes('\n')) return '"' + s.replace(/"/g, '""') + '"'
    return s
  }).join(',')).join('\n')
}

export async function GET(req: Request) {
  const url = new URL(req.url)
  const compare = url.searchParams.get('compare') === '1'
  const versionFlag = parseCsvVersionFlag(req)

  // Delegate to JSON route for authoritative rows/totals
  const jsonRes = await getJson(req)
  if (!jsonRes.ok) return jsonRes
  const data = await jsonRes.json() as { rows: Row[]; totals: { budgeted: number; actual: number; variance: number; variancePct: number }; prevTotals?: { budgeted: number; actual: number; variance: number; variancePct: number } | null; asOf: string; start: string | null; end: string | null; period: string | null }
  const asOfIso = data.asOf
  const rowsWithPrev = data.rows

  const header: string[] = [buildCsvCaption(data.start, data.end, asOfIso)]
  const head = compare
    ? ['Account', 'Budgeted (Cur)', 'Budgeted (Prev)', 'Budgeted Δ', 'Budgeted %', 'Actual (Cur)', 'Actual (Prev)', 'Actual Δ', 'Actual %']
    : ['Account', 'Budgeted', 'Actual', 'Variance', 'Variance %']
  const csvRows: string[][] = []
  if (versionFlag) csvRows.push(['CSV-Version','1'])
  csvRows.push(header)
  csvRows.push([])
  csvRows.push(head)
  let tBudgeted = 0, tActual = 0, tVariance = 0
  let tPrevBudgeted = 0, tPrevActual = 0, tPrevVariance = 0
  for (const r of rowsWithPrev as any[]) {
    tBudgeted += r.budgeted
    tActual += r.actual
    tVariance += r.variance
    if (compare && r.prev) {
      tPrevBudgeted += r.prev.budgeted
      tPrevActual += r.prev.actual
      tPrevVariance += r.prev.variance
      const budDelta = r.budgeted - r.prev.budgeted
      const budPct = r.prev.budgeted !== 0 ? ((budDelta / Math.abs(r.prev.budgeted)) * 100) : 0
      const actDelta = r.actual - r.prev.actual
      const actPct = r.prev.actual !== 0 ? ((actDelta / Math.abs(r.prev.actual)) * 100) : 0
      csvRows.push([
        r.account,
        String(r.budgeted), String(r.prev.budgeted), String(Math.round(budDelta * 100) / 100), String(Math.round(budPct * 100) / 100) + '%',
        String(r.actual), String(r.prev.actual), String(Math.round(actDelta * 100) / 100), String(Math.round(actPct * 100) / 100) + '%',
      ])
    } else {
      csvRows.push([r.account, String(r.budgeted), String(r.actual), String(r.variance), String(Math.round(r.variancePct * 100) / 100) + '%'])
    }
  }
  if (compare) {
    const tBudDelta = tBudgeted - tPrevBudgeted
    const tBudPct = tPrevBudgeted !== 0 ? (tBudDelta / Math.abs(tPrevBudgeted)) * 100 : 0
    const tActDelta = tActual - tPrevActual
    const tActPct = tPrevActual !== 0 ? (tActDelta / Math.abs(tPrevActual)) * 100 : 0
    csvRows.push(['Totals', String(tBudgeted), String(tPrevBudgeted), String(Math.round(tBudDelta * 100) / 100), String(Math.round(tBudPct * 100) / 100) + '%', String(tActual), String(tPrevActual), String(Math.round(tActDelta * 100) / 100), String(Math.round(tActPct * 100) / 100) + '%'])
  } else {
    const tVariancePct = tBudgeted !== 0 ? (tVariance / tBudgeted) * 100 : 0
    csvRows.push(['Totals', String(tBudgeted), String(tActual), String(tVariance), String(Math.round(tVariancePct * 100) / 100) + '%'])
  }

  const csv = toCSV(csvRows)
  const filename = buildCsvFilename('budget-vs-actual', { asOfIso, tokens: compare ? ['compare'] : undefined, tokenPosition: 'before' })
  return new NextResponse(csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Cache-Control': 'no-store',
    },
  })
}