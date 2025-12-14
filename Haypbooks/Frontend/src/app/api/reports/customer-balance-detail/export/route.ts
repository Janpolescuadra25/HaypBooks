import { NextResponse } from 'next/server'
import { getRoleFromCookies, hasPermission } from '@/lib/rbac-server'
import { deriveRange, buildCsvRangeOrDate } from '@/lib/report-helpers'
import { buildCsvFilename, parseCsvVersionFlag } from '@/lib/csv'
import { db } from '@/mock/db'
import { formatCurrency } from '@/lib/format'
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
  const versionFlag = parseCsvVersionFlag(req)
  const period = url.searchParams.get('period') || undefined
  let start = url.searchParams.get('start')
  let end = url.searchParams.get('end')
  const derived = deriveRange(period, start, end)
  start = derived.start || start
  end = derived.end || end
  // Delegate to JSON route for data
  const jsonResp = await getJson(req)
  if (!('ok' in jsonResp) ? (jsonResp as any).status !== 200 : !(jsonResp as Response).ok) return jsonResp as any
  const data = await (jsonResp as Response).json() as {
    rows: Array<{ date: string; type: string; number: string; customer: string; memo: string; amount: number }>
    totals?: { amount: number }
    asOf: string
    start: string | null
    end: string | null
  }
  const asOfIso = (data.asOf || end || new Date().toISOString()).slice(0,10)
  const rows = data.rows || []
  const captionRow: string[] = [buildCsvRangeOrDate(start, end, asOfIso)]
  const headerRow = ['Date','Type','Number','Customer','Memo','Amount']
  const baseCurrency = (db.settings?.baseCurrency as string) || 'USD'
  const csvRows: string[][] = []
  if (versionFlag) csvRows.push(['CSV-Version','1'])
  csvRows.push(captionRow)
  csvRows.push([])
  csvRows.push(headerRow)
  for (const r of rows) {
    csvRows.push([r.date, r.type, r.number, r.customer, r.memo, formatCurrency(Number(r.amount) || 0, baseCurrency)])
  }
  const total = typeof data?.totals?.amount === 'number' ? data.totals.amount : rows.reduce((s, r) => s + (Number(r.amount) || 0), 0)
  csvRows.push(['Totals','','','','', formatCurrency(Number(total) || 0, baseCurrency)])
  const csv = toCSV(csvRows)
  const filename = buildCsvFilename('customer-balance-detail', { asOfIso })
  return new NextResponse(csv, { headers: { 'Content-Type': 'text/csv; charset=utf-8', 'Content-Disposition': `attachment; filename="${filename}"` } })
}
