import { NextResponse } from 'next/server'
import { getRoleFromCookies, hasPermission } from '@/lib/rbac-server'
import { buildCsvFilename } from '@/lib/csv'
import { buildCsvRangeOrDate } from '@/lib/report-helpers'
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
  const jsonRes: any = await JSON_GET(req)
  if (!jsonRes || jsonRes.status !== 200) return new NextResponse('Failed to generate CSV', { status: 500 })
  const { rows, totals, asOf, start, end } = await jsonRes.json()
  const asOfIso: string = asOf
  // Caption-first row using shared helper for range/bare date behavior
  const captionRow: string[] = [buildCsvRangeOrDate(start || null, end || null, asOfIso)]
  const headerRow = ['Date','Type','Number','Vendor','Memo','Amount']
  const csvRows: string[][] = [captionRow, [], headerRow]
  for (const r of rows as Array<{ date: string; type: string; number: string; vendor: string; memo: string; amount: number }>) {
    csvRows.push([r.date, r.type, r.number, r.vendor, r.memo, String(r.amount)])
  }
  csvRows.push(['Totals','','','','', String(totals?.amount ?? 0)])
  const csv = toCSV(csvRows)
  const filename = buildCsvFilename('bill-payment-list', { asOfIso })
  return new NextResponse(csv, { headers: { 'Content-Type': 'text/csv; charset=utf-8', 'Content-Disposition': `attachment; filename="${filename}"` } })
}
