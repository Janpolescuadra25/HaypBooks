import { NextResponse } from 'next/server'
import { getRoleFromCookies, hasPermission } from '@/lib/rbac-server'
import { buildCsvCaption } from '@/lib/report-helpers'
import { buildCsvFilename, sanitizeToken, parseCsvVersionFlag } from '@/lib/csv'
import { GET as getJson } from '../route'
import { formatCurrency } from '@/lib/format'
import { db } from '@/mock/db'

function toCSV(rows: string[][]) {
  return rows.map(r => r.map((c) => {
    if (c == null) return ''
    const s = String(c)
    if (s.includes(',') || s.includes('"') || s.includes('\n')) return '"' + s.replace(/"/g, '""') + '"'
    return s
  }).join(',')).join('\n')
}

// JSON-first: delegate to sibling JSON handler

export async function GET(req: Request) {
  const role = getRoleFromCookies()
  if (!hasPermission(role, 'reports:read')) return new NextResponse('Forbidden', { status: 403 })
  // leverage JSON route to avoid duplication
  const url = new URL(req.url)
  const product = url.searchParams.get('product') || undefined
  const versionFlag = parseCsvVersionFlag(req)
  const jsonRes: any = await getJson(req)
  if (!jsonRes || jsonRes.status !== 200) return new NextResponse('Failed to generate CSV', { status: 500 })
  const { rows, totals, asOf, start, end } = await jsonRes.json()
  const asOfIso: string = asOf
  const baseCurrency = (db.settings?.baseCurrency as string) || 'USD'
  const header: string[] = [buildCsvCaption(start, end, asOfIso)]
  const csvRows: string[][] = [header, [], ['Product/Service','Transactions','Qty','Amount']]
  for (const r of rows as Array<{ product: string; transactions: number; qty: number; amount: number }>) {
    csvRows.push([
      r.product,
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
      'Content-Disposition': `attachment; filename=\"${buildCsvFilename('sales-by-product-summary', { start: start || undefined, end: end || undefined, asOfIso, tokens: product ? ['product', sanitizeToken(product)] : undefined })}\"`,
      'Cache-Control': 'no-store',
    },
  })
}
