import { NextResponse } from 'next/server'
import { getRoleFromCookies, hasPermission } from '@/lib/rbac-server'
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
  const role = getRoleFromCookies()
  if (!hasPermission(role, 'reports:read')) return new NextResponse('Forbidden', { status: 403 })
  // Delegate to sibling JSON route
  const jsonRes: any = await getJson(req)
  if (!jsonRes || jsonRes.status !== 200) return new NextResponse('Failed to generate CSV', { status: 500 })
  const { rows, totals, asOf, start, end } = await jsonRes.json()
  const versionFlag = parseCsvVersionFlag(req)
  const asOfIso: string = asOf
  const captionRow: string[] = [buildCsvRangeOrDate(start || null, end || null, asOfIso)]
  const headerRow = ['Vendor','Number','Bill Date','Due Date','Terms','Amount Due']
  // Build CSV rows, optionally injecting CSV-Version row when explicitly requested
  const csvRows: string[][] = versionFlag ? [['CSV-Version','1'], captionRow, [], headerRow] : [captionRow, [], headerRow]
  for (const r of rows as Array<{ vendor: string; number: string; billDate: string; dueDate: string; terms: string; amountDue: number }>) {
    csvRows.push([r.vendor, r.number, r.billDate, r.dueDate, r.terms, String(r.amountDue)])
  }
  csvRows.push(['Totals','','','','', String(totals?.amountDue ?? 0)])
  const csv = toCSV(csvRows)
  const filename = buildCsvFilename('unpaid-bills', { asOfIso })
  return new NextResponse(csv, { headers: { 'Content-Type': 'text/csv; charset=utf-8', 'Content-Disposition': `attachment; filename="${filename}"` } })
}
