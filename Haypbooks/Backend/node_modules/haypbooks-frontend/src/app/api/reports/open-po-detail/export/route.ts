import { NextResponse } from 'next/server'
import { getRoleFromCookies, hasPermission } from '@/lib/rbac-server'
import { buildCsvFilename } from '@/lib/csv'
import { buildCsvRangeOrDate } from '@/lib/report-helpers'
import { GET as getJson } from '../route'

type Row = { date: string; type: string; number: string; vendor: string; item: string; qtyOrdered: number; qtyReceived: number; qtyOpen: number; rate: number; amountOpen: number }

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
  // Delegate to JSON route to ensure parity
  const jsonRes: any = await getJson(req)
  if (!jsonRes || jsonRes.status !== 200) return new NextResponse('Failed to build export', { status: 500 })
  const data = await jsonRes.json() as { rows: Row[]; totals: { qtyOrdered: number; qtyReceived: number; qtyOpen: number; amountOpen: number }; asOf: string; start?: string | null; end?: string | null }
  const asOfIso = (data.asOf || new Date().toISOString()).slice(0,10)

  const captionRow: string[] = [buildCsvRangeOrDate(data.start || null, data.end || null, asOfIso)]
  const headerRow = ['Date','Type','Number','Vendor','Item','Qty Ordered','Qty Received','Qty Open','Rate','Amount Open']
  const csvRows: string[][] = [captionRow, [], headerRow]
  for (const r of data.rows) {
    csvRows.push([r.date, r.type, r.number, r.vendor, r.item, String(r.qtyOrdered), String(r.qtyReceived), String(r.qtyOpen), String(r.rate), String(r.amountOpen)])
  }
  csvRows.push(['Totals','','','', '', String(data.totals.qtyOrdered || 0), String(data.totals.qtyReceived || 0), String(data.totals.qtyOpen || 0), '', String(data.totals.amountOpen || 0)])

  const csv = toCSV(csvRows)
  const filename = buildCsvFilename('open-po-detail', { asOfIso })
  return new NextResponse(csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Cache-Control': 'no-store',
    },
  })
}
