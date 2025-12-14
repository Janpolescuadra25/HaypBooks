import { NextResponse } from 'next/server'
import { getRoleFromCookies, hasPermission } from '@/lib/rbac-server'
import { buildCsvRangeOrDate } from '@/lib/report-helpers'
import { buildCsvFilename } from '@/lib/csv'
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
  const captionRow: string[] = [buildCsvRangeOrDate(start || null, end || null, asOfIso)]
  const headerRow = ['Vendor','Number','Date','Item','Qty Ordered','Qty Received','Qty Open','Rate','Amount Open']
  const csvRows: string[][] = [captionRow, [], headerRow]
  for (const r of rows as Array<{ vendor: string; number: string; date: string; item: string; qtyOrdered: number; qtyReceived: number; qtyOpen: number; rate: number; amountOpen: number }>) {
    csvRows.push([r.vendor, r.number, r.date, r.item, String(r.qtyOrdered), String(r.qtyReceived), String(r.qtyOpen), String(r.rate), String(r.amountOpen)])
  }
  csvRows.push(['Totals','','','', String(totals?.qtyOrdered ?? 0), String(totals?.qtyReceived ?? 0), String(totals?.qtyOpen ?? 0), '', String(totals?.amountOpen ?? 0)])
  const csv = toCSV(csvRows)
  const filename = buildCsvFilename('open-po-list-by-vendor', { asOfIso })
  return new NextResponse(csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="${filename}"`,
    },
  })
}
