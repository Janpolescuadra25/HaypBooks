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

// Rows are sourced from the sibling JSON route to avoid logic drift

export async function GET(req: Request) {
  const role = getRoleFromCookies()
  if (!hasPermission(role, 'reports:read')) return new NextResponse('Forbidden', { status: 403 })
  const url = new URL(req.url)
  const period = url.searchParams.get('period') || undefined
  let start = url.searchParams.get('start')
  let end = url.searchParams.get('end')
  const derived = deriveRange(period, start, end)
  start = derived.start || start
  end = derived.end || end
  // Delegate to JSON route for authoritative data
  const jsonRes: any = await getJson(req)
  if (!jsonRes || jsonRes.status !== 200) return new NextResponse('Failed to generate CSV', { status: 500 })
  const { rows, totals, asOf } = await jsonRes.json()
  const asOfIso: string = asOf
  const baseCurrency = (db.settings?.baseCurrency as string) || 'USD'

  const captionRow: string[] = [buildCsvRangeOrDate(start, end, asOfIso)]
  const headerRow = ['Customer','Invoice Number','Due Date','Days Overdue','Open Balance','Contact','Phone']
  const includeVersion = parseCsvVersionFlag(req)
  const csvRows: string[][] = includeVersion
    ? [["CSV-Version","1"], captionRow, [], headerRow]
    : [captionRow, [], headerRow]
  for (const r of rows as Array<{ customer: string; invoiceNumber: string; dueDate: string; daysOverdue: number; openBalance: number; contact: string; phone: string }>) {
    csvRows.push([
      r.customer,
      r.invoiceNumber,
      r.dueDate,
      String(r.daysOverdue),
      formatCurrency(Number(r.openBalance || 0), baseCurrency),
      r.contact,
      r.phone,
    ])
  }
  const totalAmount = Number(totals?.openBalance ?? 0)
  // Totals under the Open Balance column
  csvRows.push(['Totals','','','', formatCurrency(totalAmount, baseCurrency),'',''])
  const csv = toCSV(csvRows)
  const filename = buildCsvFilename('collections-report', { asOfIso })
  return new NextResponse(csv, { headers: { 'Content-Type': 'text/csv; charset=utf-8', 'Content-Disposition': `attachment; filename=\"${filename}\"` } })
}
