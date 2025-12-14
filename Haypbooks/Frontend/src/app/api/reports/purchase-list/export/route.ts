import { NextResponse } from 'next/server'
import { getRoleFromCookies, hasPermission } from '@/lib/rbac-server'
import { buildCsvFilename } from '@/lib/csv'
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
  const asOfIso: string = asOf
  const caption: string[] = [buildCsvRangeOrDate(start || null, end || null, asOfIso)]
  const header = ['Date','Type','Number','Vendor','Account','Memo','Amount']
  const csvRows: string[][] = [caption, [], header]
  for (const r of rows as Array<{ date: string; type: string; number: string; vendor: string; account: string; memo: string; amount: number }>) {
    csvRows.push([r.date, r.type, r.number, r.vendor, r.account, r.memo, String(r.amount)])
  }
  csvRows.push(['Totals','','','','','', String(totals?.amount ?? 0)])

  const csv = toCSV(csvRows)
  return new NextResponse(csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="${buildCsvFilename('purchase-list', { asOfIso })}"`,
      'Cache-Control': 'no-store',
    },
  })
}
