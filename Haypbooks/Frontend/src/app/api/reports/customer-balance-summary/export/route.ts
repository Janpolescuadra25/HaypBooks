import { NextResponse } from 'next/server'
import { getRoleFromCookies, hasPermission } from '@/lib/rbac-server'
import { deriveRange, buildCsvRangeOrDate } from '@/lib/report-helpers'
import { buildCsvFilename, parseCsvVersionFlag } from '@/lib/csv'
import { db } from '@/mock/db'
import { formatCurrency } from '@/lib/format'
import { GET as JSON_GET } from '../route'

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
  const asOfIso = end || new Date().toISOString().slice(0, 10)
  // Delegate to JSON route for single source of truth
  const jsonResp: any = await JSON_GET(req as any)
  if (!jsonResp?.ok) return jsonResp
  const data = await jsonResp.json() as { rows: Array<{ customer: string; openBalance: number }>; totals?: { openBalance: number }; asOf?: string }
  const rows = data.rows || []
  const captionRow: string[] = [buildCsvRangeOrDate(start, end, asOfIso)]
  const headerRow = ['Customer','Open Balance']
  const baseCurrency = (db.settings?.baseCurrency as string) || 'USD'
  const csvRows: string[][] = []
  if (versionFlag) csvRows.push(['CSV-Version','1'])
  csvRows.push(captionRow)
  csvRows.push([])
  csvRows.push(headerRow)
  for (const r of rows) {
    csvRows.push([r.customer, formatCurrency(Number(r.openBalance) || 0, baseCurrency)])
  }
  const total = data?.totals?.openBalance
  if (typeof total === 'number') {
    csvRows.push(['Totals', formatCurrency(Number(total) || 0, baseCurrency)])
  }
  const csv = toCSV(csvRows)
  const filename = buildCsvFilename('customer-balance-summary', { asOfIso })
  return new NextResponse(csv, { headers: { 'Content-Type': 'text/csv; charset=utf-8', 'Content-Disposition': `attachment; filename="${filename}"` } })
}
