import { NextResponse } from 'next/server'
import { getRoleFromCookies, hasPermission } from '@/lib/rbac-server'
import { buildCsvFilename, parseCsvVersionFlag } from '@/lib/csv'
import { buildCsvRangeOrDate } from '@/lib/report-helpers'
import { GET as getJson } from '../route'
import { formatCurrency } from '@/lib/format'
import { db } from '@/mock/db'

// Using shared summary generator; detail generation removed.


function toCSV(rows: string[][]) {
  return rows.map(r => r.map((c) => {
    if (c == null) return ''
    const s = String(c)
    if (s.includes(',') || s.includes('"') || s.includes('\n')) return '"' + s.replace(/"/g, '""') + '"'
    return s
  }).join(',')).join('\n')
}

// detail generator removed

export async function GET(req: Request) {
  const role = getRoleFromCookies()
  if (!hasPermission(role, 'reports:read')) return new NextResponse('Forbidden', { status: 403 })
  // Delegate to sibling JSON route
  const versionFlag = parseCsvVersionFlag(req)
  const jsonRes: any = await getJson(req)
  if (!jsonRes || jsonRes.status !== 200) return new NextResponse('Failed to generate CSV', { status: 500 })
  const { rows, totals, asOf, start, end } = await jsonRes.json()
  const asOfIso: string = asOf
  const baseCurrency = (db.settings?.baseCurrency as string) || 'USD'

  // Deterministic caption via shared helper
  const caption: string[] = [buildCsvRangeOrDate(start, end, asOfIso)]
  const header = ['Item','Transactions','Qty','Amount']
  const csvRows: string[][] = [caption, [], header]
  for (const r of rows as Array<{ item: string; transactions: number; qty: number; amount: number }>) {
    csvRows.push([
      r.item,
      String(r.transactions),
      String(r.qty),
      formatCurrency(Number(r.amount) || 0, baseCurrency),
    ])
  }
  csvRows.push([
    'Totals',
    String(totals?.transactions ?? 0),
    String(totals?.qty ?? 0),
    formatCurrency(Number(totals?.amount ?? 0) || 0, baseCurrency),
  ])

  if (versionFlag) csvRows.unshift(['CSV-Version','1'])

  const csv = toCSV(csvRows)
  return new NextResponse(csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="${buildCsvFilename('purchases-by-product-summary', { start: start || undefined, end: end || undefined, asOfIso })}"`,
      'Cache-Control': 'no-store',
    },
  })
}
