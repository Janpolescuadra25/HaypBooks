import { NextResponse } from 'next/server'
import { getRoleFromCookies, hasPermission } from '@/lib/rbac-server'
import { buildCsvCaption } from '@/lib/report-helpers'
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

export async function GET(req: Request) {
  const role = getRoleFromCookies()
  if (!hasPermission(role, 'reports:read')) return new NextResponse('Forbidden', { status: 403 })
  // Delegate to sibling JSON handler for source-of-truth rows/totals
  const jsonRes: any = await getJson(req)
  if (!jsonRes || jsonRes.status !== 200) return new NextResponse('Failed to generate CSV', { status: 500 })
  const { rows, totals, asOf, start, end } = await jsonRes.json()
  const asOfIso: string = asOf
  const baseCurrency = (db.settings?.baseCurrency as string) || 'USD'
  const versionFlag = parseCsvVersionFlag(req)

  const header: string[] = [buildCsvCaption(start, end, asOfIso)]
  const csvRows: string[][] = [header, [], ['Date', 'Doc #', 'Customer', 'Tax Agency', 'Rate Name', 'Rate %', 'Taxable', 'Tax Amount']]
  // Optional CSV-Version metadata row first when explicitly requested
  if (versionFlag) {
    csvRows.unshift(['CSV-Version', '1'])
  }
  for (const r of rows as Array<{ date: string; doc: string; customer: string; agency: string; rateName: string; ratePct: number; taxable: number; taxAmount: number }>) {
    csvRows.push([
      r.date,
      r.doc,
      r.customer,
      r.agency,
      r.rateName,
      String(r.ratePct),
      formatCurrency(Number(r.taxable || 0), baseCurrency),
      formatCurrency(Number(r.taxAmount || 0), baseCurrency),
    ])
  }
  csvRows.push([
    'Totals','','','','','',
    formatCurrency(Number(totals?.taxable ?? 0), baseCurrency),
    formatCurrency(Number(totals?.taxAmount ?? 0), baseCurrency),
  ])

  const csv = toCSV(csvRows)
  const filename = buildCsvFilename('tax-detail', { asOfIso })
  return new NextResponse(csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Cache-Control': 'no-store',
    },
  })
}
