import { NextResponse } from 'next/server'
import { getRoleFromCookies, hasPermission } from '@/lib/rbac-server'
import { buildCsvFilename, parseCsvVersionFlag } from '@/lib/csv'
import { deriveRange, buildCsvRangeOrDate } from '@/lib/report-helpers'
import { GET as getJson } from '../route'
import { db } from '@/mock/db'
import { formatCurrency } from '@/lib/format'

function toCSV(rows: string[][]) {
  return rows.map(r => r.map((c) => {
    if (c == null) return ''
    const s = String(c)
    if (s.includes(',') || s.includes('"') || s.includes('\n')) return '"' + s.replace(/"/g, '""') + '"'
    return s
  }).join(',')).join('\n')
}

// deriveRange now imported from shared helper

// CSV now delegates to the JSON handler for data

export async function GET(req: Request) {
  const role = getRoleFromCookies()
  if (!hasPermission(role, 'reports:read')) return new NextResponse('Forbidden', { status: 403 })
  const url = new URL(req.url)
  const period = url.searchParams.get('period') || undefined
  // CSV-Version opt-in using shared helper
  const csvVersionFlag = parseCsvVersionFlag(req)
  let start = url.searchParams.get('start')
  let end = url.searchParams.get('end')
  const derived = deriveRange(period, start, end)
  start = derived.start || start
  end = derived.end || end
  // Delegate to JSON for authoritative rows + totals
  const jsonResp = await getJson(req)
  if (!jsonResp.ok) return jsonResp
  const data = await jsonResp.json() as { rows: Array<{ customer: string; type: string; number: string; invoiceDate: string; dueDate: string; aging: number; openBalance: number }>; totals?: { openBalance: number }; asOf?: string }
  const asOfIso = (data.asOf || (end || new Date().toISOString())).slice(0, 10)
  // Preserve detail behavior using shared helper: bare end date when only end; ISO range when both; otherwise 'As of <ISO>'
  const captionRow: string[] = [buildCsvRangeOrDate(start, end, asOfIso)]
  const headerRow = ['Customer','Type','Number','Invoice Date','Due Date','Aging (days)','Open Balance']
  // Build CSV rows, optionally injecting CSV-Version row when explicitly requested
  const csvRows: string[][] = []
  if (csvVersionFlag) {
    csvRows.push(['CSV-Version','1'])
  }
  csvRows.push(captionRow)
  csvRows.push([])
  csvRows.push(headerRow)
  const baseCurrency = (db.settings?.baseCurrency as string) || 'USD'
  for (const r of data.rows) {
    csvRows.push([
      r.customer,
      r.type,
      r.number,
      r.invoiceDate,
      r.dueDate,
      String(r.aging),
      formatCurrency(Number(r.openBalance) || 0, baseCurrency),
    ])
  }
  if (data.totals) {
    csvRows.push(['Totals','','','','','', formatCurrency(Number(data.totals.openBalance) || 0, baseCurrency)])
  }
  const csv = toCSV(csvRows)
  const filename = buildCsvFilename('open-invoices', { asOfIso })
  return new NextResponse(csv, { headers: { 'Content-Type': 'text/csv; charset=utf-8', 'Content-Disposition': `attachment; filename="${filename}"` } })
}
