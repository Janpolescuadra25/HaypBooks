import { NextResponse } from 'next/server'
import { getRoleFromCookies, hasPermission } from '@/lib/rbac-server'
import { buildCsvRangeOrDate } from '@/lib/report-helpers'
import { buildCsvFilename, parseCsvVersionFlag } from '@/lib/csv'
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
  // Delegate to sibling JSON route for authoritative data
  const url = new URL(req.url)
  const versionFlag = parseCsvVersionFlag(req)
  const jsonRes: any = await JSON_GET(req)
  if (!jsonRes || jsonRes.status !== 200) return new NextResponse('Failed to generate CSV', { status: 500 })
  const { rows, totals, asOf, start, end } = await jsonRes.json()

  const asOfIso: string = asOf
  const captionRow: string[] = [buildCsvRangeOrDate(start || null, end || null, asOfIso)]
  const headerRow = ['Customer','Invoice Number','Invoice Date','Due Date','Payment Date','Payment Amount','Open Balance']
  const csvRows: string[][] = []
  if (versionFlag) csvRows.push(['CSV-Version','1'])
  csvRows.push(captionRow, [], headerRow)
  for (const r of rows as Array<{ customer: string; invoiceNumber: string; invoiceDate: string; dueDate: string; paymentDate: string | null; paymentAmount: number | null; openBalance: number }>) {
    csvRows.push([
      r.customer,
      r.invoiceNumber,
      r.invoiceDate,
      r.dueDate,
      r.paymentDate || '',
      r.paymentAmount != null ? String(r.paymentAmount) : '',
      String(r.openBalance)
    ])
  }
  csvRows.push(['Totals','','','','','', String((totals?.openBalance ?? 0))])
  const csv = toCSV(csvRows)
  const filename = buildCsvFilename('invoices-and-received-payments', { asOfIso })
  return new NextResponse(csv, { headers: { 'Content-Type': 'text/csv; charset=utf-8', 'Content-Disposition': `attachment; filename=\"${filename}\"` } })
}
