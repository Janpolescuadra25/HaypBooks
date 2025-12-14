import { NextResponse } from 'next/server'
import { buildCsvFilename, parseCsvVersionFlag } from '@/lib/csv'
import { buildCsvRangeOrDate } from '@/lib/report-helpers'
import { GET as getJson } from '../route'

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
  const period = url.searchParams.get('period') || 'YTD'
  const start = url.searchParams.get('start') || null
  const end = url.searchParams.get('end') || null
  const versionFlag = parseCsvVersionFlag(req)

  const jsonRes = await getJson(req)
  if (!jsonRes.ok) return jsonRes
  const data = await jsonRes.json() as { rows: Array<{ vendor: string; tin: string; ytd: number; eligible: boolean }>; totals: { eligibleCount: number; totalYtd: number }; asOf: string; start: string | null; end: string | null; period: string | null }

  const providedStart = !!(start)
  const providedEnd = !!(end)
  const base = buildCsvRangeOrDate(providedStart ? data.start : null, providedEnd ? data.end : null, data.asOf)
  const captionRow: string[] = [(providedStart && providedEnd) ? base : `${period}-asof-${data.asOf}`]
  const headerRow = ['Vendor','TIN (masked)','YTD Nonemployee Comp','Eligible (>= $600)']
  const csvRows: string[][] = []
  if (versionFlag) csvRows.push(['CSV-Version','1'])
  csvRows.push(captionRow)
  csvRows.push([])
  csvRows.push(headerRow)
  for (const r of data.rows) {
    csvRows.push([r.vendor, r.tin, String(r.ytd), r.eligible ? 'Yes' : 'No'])
  }
  csvRows.push(['Totals','', '' + data.totals.totalYtd,''])
  const csv = toCSV(csvRows)
  const filename = buildCsvFilename('1099-contractor-balance-summary-us', { asOfIso: data.asOf, tokens: [period], tokenPosition: 'before' })
  return new NextResponse(csv, { headers: { 'Content-Type': 'text/csv; charset=utf-8', 'Content-Disposition': `attachment; filename="${filename}"` } })
}
