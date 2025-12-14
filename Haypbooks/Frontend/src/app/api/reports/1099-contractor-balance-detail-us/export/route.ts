import { NextResponse } from 'next/server'
import { getRoleFromCookies, hasPermission } from '@/lib/rbac-server'
import { db } from '@/mock/db'
import { formatCurrency } from '@/lib/format'
import { buildCsvFilename, parseCsvVersionFlag } from '@/lib/csv'
import { deriveRange, buildCsvRangeOrDate } from '@/lib/report-helpers'
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
  const role = getRoleFromCookies()
  if (!hasPermission(role, 'reports:read')) return new NextResponse('Forbidden', { status: 403 })
  const url = new URL(req.url)
  const period = url.searchParams.get('period') || 'YTD'
  const qStart = url.searchParams.get('start')
  const qEnd = url.searchParams.get('end')
  const { start: dStart, end: dEnd } = deriveRange(qStart && qEnd ? 'Custom' : period, qStart, qEnd)
  // Delegate to JSON
  const jsonResp = await getJson(req)
  if (!jsonResp.ok) return jsonResp
  const data = await jsonResp.json() as { rows: Array<{ vendor: string; tin: string; ytd: number; eligible: boolean }>; totals?: { totalYtd: number }; asOf?: string }
  const asOfIso = (data.asOf || (dEnd || new Date().toISOString())).slice(0,10)
  const versionFlag = parseCsvVersionFlag(req)
  const baseCurrency = (db.settings?.baseCurrency as string) || 'USD'
  const csvRows: string[][] = []
  if (versionFlag) csvRows.push(['CSV-Version','1'])
  const base = buildCsvRangeOrDate(dStart, dEnd, asOfIso)
  const caption = (dStart && dEnd) ? base : `${period}-asof-${asOfIso}`
  csvRows.push([caption])
  csvRows.push([])
  const headerRow = ['Vendor','TIN (masked)','YTD Nonemployee Comp','Eligible (>= $600)']
  csvRows.push(headerRow)
  for (const r of data.rows) {
    csvRows.push([r.vendor, r.tin, formatCurrency(Number(r.ytd || 0), baseCurrency), r.eligible ? 'Yes' : 'No'])
  }
  if (data.totals) {
    csvRows.push(['Totals','', formatCurrency(Number(data.totals.totalYtd || 0), baseCurrency), ''])
  }
  const csv = toCSV(csvRows)
  const filename = buildCsvFilename('1099-contractor-balance-detail-us', { asOfIso, tokens: [period], tokenPosition: 'before' })
  return new NextResponse(csv, { headers: { 'Content-Type': 'text/csv; charset=utf-8', 'Content-Disposition': `attachment; filename="${filename}"` } })
}
