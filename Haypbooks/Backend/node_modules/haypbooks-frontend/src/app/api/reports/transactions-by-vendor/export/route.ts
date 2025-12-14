import { NextResponse } from 'next/server'
import { getRoleFromCookies, hasPermission } from '@/lib/rbac-server'
import { deriveRange, buildCsvCaption } from '@/lib/report-helpers'
import { buildCsvFilename, parseCsvVersionFlag } from '@/lib/csv'
import { GET as GET_API } from '../route'
import { formatCurrency } from '@/lib/format'
import { db } from '@/mock/db'

type Row = { date: string; type: string; number: string; vendor: string; memo: string; amount: number }

function toCSV(rows: string[][]) {
  return rows
    .map(r =>
      r
        .map(c => {
          if (c == null) return ''
          const s = String(c)
          return s.includes(',') || s.includes('"') || s.includes('\n')
            ? '"' + s.replace(/"/g, '""') + '"'
            : s
        })
        .join(',')
    )
    .join('\n')
}

export async function GET(req: Request) {
  const role = getRoleFromCookies()
  if (!hasPermission(role, 'reports:read')) return new NextResponse('Forbidden', { status: 403 })
  const wantCsvVersion = parseCsvVersionFlag(req)

  const url = new URL(req.url)
  const period = url.searchParams.get('period') || 'Custom'
  const qStart = url.searchParams.get('start')
  const qEnd = url.searchParams.get('end')
  const { start, end } = deriveRange(period, qStart, qEnd)
  const asOfIso = end || new Date().toISOString().slice(0, 10)

  // Call the JSON API handler directly for data consistency and to avoid network fetches
  const apiUrl = new URL(req.url)
  apiUrl.pathname = apiUrl.pathname.replace('/export', '')
  const apiRes = await GET_API(new Request(apiUrl.toString()))
  if (!('status' in apiRes) || (apiRes as any).status !== 200) return new NextResponse('Failed to build export', { status: 500 })
  const data = await (apiRes as any).json()

  const header: string[] = [buildCsvCaption(start || null, end || null, asOfIso)]
  const csvRows: string[][] = wantCsvVersion
    ? [["CSV-Version","1"], header, [], ['Date', 'Type', 'Number', 'Vendor', 'Memo', 'Amount']]
    : [header, [], ['Date', 'Type', 'Number', 'Vendor', 'Memo', 'Amount']]
  const baseCurrency = (db.settings?.baseCurrency as string) || 'USD'
  let grand = 0
  let current: string | null = null
  let subtotal = 0
  for (const r of (data.rows as Row[])) {
    if (current !== r.vendor) {
      if (current !== null) csvRows.push(['Subtotal', '', '', current, '', formatCurrency(Number(subtotal) || 0, baseCurrency)])
      current = r.vendor
      subtotal = 0
    }
    subtotal += r.amount
    grand += r.amount
    csvRows.push([r.date, r.type, r.number, r.vendor, r.memo, formatCurrency(Number(r.amount) || 0, baseCurrency)])
  }
  if (current !== null) csvRows.push(['Subtotal', '', '', current, '', formatCurrency(Number(subtotal) || 0, baseCurrency)])
  csvRows.push(['Total', '', '', '', '', formatCurrency(Number(grand) || 0, baseCurrency)])

  const csv = toCSV(csvRows)
  const filename = buildCsvFilename('transactions-by-vendor', { asOfIso })
  return new NextResponse(csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Cache-Control': 'no-store',
    },
  })
}
