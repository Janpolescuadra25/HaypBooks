import { NextResponse } from 'next/server'
import { getRoleFromCookies, hasPermission } from '@/lib/rbac-server'
import { buildCsvCaption } from '@/lib/report-helpers'
import { buildCsvFilename, parseCsvVersionFlag } from '@/lib/csv'
import { GET as getJson } from '../route'
import { db } from '@/mock/db'
import { formatCurrency } from '@/lib/format'

function toCsvCell(v: any) {
  if (v == null) return ''
  const s = String(v)
  if (/[,"\n]/.test(s)) return '"' + s.replace(/"/g, '""') + '"'
  return s
}

export async function GET(req: Request) {
  const role = getRoleFromCookies()
  if (!hasPermission(role, 'reports:read')) return new NextResponse('Forbidden', { status: 403 })
  const url = new URL(req.url)
  const end = url.searchParams.get('end') || new Date().toISOString().slice(0, 10)
  const baseCurrency = (db.settings?.baseCurrency as string) || 'USD'
  // Delegate to JSON route
  const jsonResp = await getJson(req)
  if (!jsonResp.ok) return jsonResp
  const data = await jsonResp.json() as { rows: Array<{ date: string; customer: string; description?: string; amount: number }> }
  const rows = data.rows

  const out: string[] = []
  // Optional CSV-Version metadata first when opted-in
  if (parseCsvVersionFlag(req)) out.push('CSV-Version,1')
  out.push([buildCsvCaption(null, null, end)].join(','))
  out.push('')
  out.push(['Date', 'Deposit ID', 'Deposit To', 'Memo', 'Payments', 'Total'].join(','))
  let sumPayments = 0
  let sumTotal = 0
  // JSON route currently returns date, customer, description, amount; for CSV we emit Deposit ID and Deposit To as empty in this mock
  for (const r of rows) {
    sumPayments += 1
    sumTotal += Number(r.amount || 0)
    out.push([
      r.date,
      '', // Deposit ID
      '', // Deposit To
      r.description || '',
      '1',
      formatCurrency(Number(r.amount || 0), baseCurrency),
    ].map(toCsvCell).join(','))
  }

  // Append totals row
  out.push('')
  out.push([
    '', // Date
    '', // Deposit ID
    '', // Deposit To
    'Totals', // Memo column used for label
    String(sumPayments),
    formatCurrency(sumTotal, baseCurrency),
  ].map(toCsvCell).join(','))

  const body = out.join('\n')
  const filename = buildCsvFilename('deposit-detail', { asOfIso: end })
  return new NextResponse(body, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Cache-Control': 'no-store',
    },
  })
}
