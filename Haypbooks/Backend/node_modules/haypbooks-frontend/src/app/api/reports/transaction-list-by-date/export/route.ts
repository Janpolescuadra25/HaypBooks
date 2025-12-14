import { NextResponse } from 'next/server'
import { getRoleFromCookies, hasPermission } from '@/lib/rbac-server'
import { deriveRange, buildCsvCaption } from '@/lib/report-helpers'
import { buildCsvFilename, parseCsvVersionFlag, sanitizeToken } from '@/lib/csv'
import { db } from '@/mock/db'
import { formatCurrency } from '@/lib/format'
import { GET as GET_API } from '../route'

type Row = { date: string; type: string; number: string; name: string; memo: string; debit: number; credit: number }

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
  const url = new URL(req.url)
  const period = url.searchParams.get('period') || undefined
  const versionFlag = parseCsvVersionFlag(req)
  const qStart = url.searchParams.get('start')
  const qEnd = url.searchParams.get('end')
  const { start, end } = deriveRange(period, qStart, qEnd)
  const asOfIso = end || new Date().toISOString().slice(0, 10)

  // Reuse JSON API logic to build deterministic rows and totals
  const apiUrl = new URL(req.url)
  apiUrl.pathname = apiUrl.pathname.replace('/export', '')
  const apiRes = await GET_API(new Request(apiUrl.toString()))
  if (!('status' in apiRes) || (apiRes as any).status !== 200) return new NextResponse('Failed to build export', { status: 500 })
  const data = await (apiRes as any).json()

  const csvRows: string[][] = []
  const baseCurrency = (db.settings?.baseCurrency as string) || 'USD'
  if (versionFlag) csvRows.push(['CSV-Version','1'])
  csvRows.push([buildCsvCaption(start || null, end || null, asOfIso)])
  csvRows.push([])
  csvRows.push(['Date', 'Type', 'Number', 'Name', 'Memo', 'Debit', 'Credit'])
  for (const r of (data.rows as Row[])) {
    csvRows.push([
      r.date,
      r.type,
      r.number,
      r.name,
      r.memo,
      formatCurrency(Number(r.debit)||0, baseCurrency),
      formatCurrency(Number(r.credit)||0, baseCurrency),
    ])
  }
  csvRows.push([
    'Total','', '', '', '',
    formatCurrency(Number(data.totals.debit)||0, baseCurrency),
    formatCurrency(Number(data.totals.credit)||0, baseCurrency),
  ])

  const csv = toCSV(csvRows)
  const tokens: string[] = []
  if (period) tokens.push(`period-${sanitizeToken(period)}`)
  const filename = buildCsvFilename('transaction-list-by-date', { asOfIso, start: start || undefined, end: end || undefined, tokens })
  return new NextResponse(csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Cache-Control': 'no-store',
    },
  })
}
