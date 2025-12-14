import { NextResponse } from 'next/server'
import { getRoleFromCookies, hasPermission } from '@/lib/rbac-server'
import { deriveRange, buildCsvRangeOrDate } from '@/lib/report-helpers'
import { buildCsvFilename } from '@/lib/csv'
import { GET as getJson } from '../route'

type Row = { date: string; type: string; number: string; item: string; vendor: string; qty: number; rate: number; amount: number }


function toCSV(rows: string[][]) {
  return rows.map(r => r.map((c) => {
    if (c == null) return ''
    const s = String(c)
    if (s.includes(',') || s.includes('"') || s.includes('\n')) return '"' + s.replace(/"/g, '""') + '"'
    return s
  }).join(',')).join('\n')
}

// CSV now delegates to the sibling JSON route to avoid logic drift

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
  const jsonResp = await getJson(req)
  if (!jsonResp.ok) return jsonResp
  const data = await jsonResp.json() as { rows: Row[]; totals?: { qty: number; amount: number }; asOf?: string }
  const asOfIso = (data.asOf || (end || new Date().toISOString())).slice(0, 10)

  const captionRow: string[] = [buildCsvRangeOrDate(start, end, asOfIso)]
  const headerRow = ['Date','Type','Number','Item','Vendor','Qty','Rate','Amount']
  const csvRows: string[][] = [captionRow, [], headerRow]

  for (const r of data.rows) {
    csvRows.push([r.date, r.type, r.number, r.item, r.vendor, String(r.qty), String(r.rate), String(r.amount)])
  }
  if (data.totals) {
    csvRows.push(['Totals','','','', '', String(data.totals.qty), '', String(data.totals.amount)])
  }

  const csv = toCSV(csvRows)
  const filename = buildCsvFilename('purchases-by-vendor-detail', { asOfIso })
  return new NextResponse(csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Cache-Control': 'no-store',
    },
  })
}
