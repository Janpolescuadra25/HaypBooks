import { NextResponse } from 'next/server'
import { getRoleFromCookies, hasPermission } from '@/lib/rbac-server'
import { buildCsvRangeOrDate } from '@/lib/report-helpers'
import { buildCsvFilename } from '@/lib/csv'
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
  // Delegate to sibling JSON route
  const jsonRes: any = await getJson(req)
  if (!jsonRes || jsonRes.status !== 200) return new NextResponse('Failed to generate CSV', { status: 500 })
  const { rows, totals, asOf, start, end } = await jsonRes.json()
  const asOfIso: string = asOf
  const baseCurrency = (db.settings?.baseCurrency as string) || 'USD'

  const captionRow: string[] = [buildCsvRangeOrDate(start, end, asOfIso)]
  const headerRow = ['Date','Employee','Customer','Service','Description','Hours','Rate','Amount']
  const csvRows: string[][] = [captionRow, [], headerRow]
  for (const r of rows as Array<{ date: string; employee: string; customer: string; service: string; description?: string; hours: number; rate: number; amount: number }>) {
    csvRows.push([
      r.date,
      r.employee,
      r.customer,
      r.service,
      r.description || '',
      String(r.hours),
      formatCurrency(Number(r.rate || 0), baseCurrency),
      formatCurrency(Number(r.amount || 0), baseCurrency),
    ])
  }
  csvRows.push([
    'Totals','','','','',
    String(totals?.hours ?? 0),
    '',
    formatCurrency(Number(totals?.amount ?? 0), baseCurrency),
  ])
  const csv = toCSV(csvRows)
  const filename = buildCsvFilename('unbilled-time', { asOfIso })
  return new NextResponse(csv, { headers: { 'Content-Type': 'text/csv; charset=utf-8', 'Content-Disposition': `attachment; filename=\"${filename}\"` } })
}
