import { NextResponse } from 'next/server'
import { getRoleFromCookies, hasPermission } from '@/lib/rbac-server'
import { deriveRange, buildCsvCaption } from '@/lib/report-helpers'
import { buildCsvFilename, parseCsvVersionFlag } from '@/lib/csv'
import { db } from '@/mock/db'
import { formatCurrency } from '@/lib/format'
import { GET as GET_API } from '../route'

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
  const rawPeriod = url.searchParams.get('period') || undefined
  const period = rawPeriod === 'ThisMonth' ? 'MTD' : rawPeriod === 'ThisQuarter' ? 'QTD' : rawPeriod
  let start = url.searchParams.get('start')
  let end = url.searchParams.get('end')
  const derived = deriveRange(period, start, end)
  start = derived.start || start
  end = derived.end || end

  const asOfIso = end || new Date().toISOString().slice(0, 10)
  // Build data by calling JSON API handler directly (no network fetch)
  const apiUrl = new URL(req.url)
  apiUrl.pathname = apiUrl.pathname.replace('/export', '')
  const apiRes = await GET_API(new Request(apiUrl.toString()))
  if (!('status' in apiRes) || (apiRes as any).status !== 200) return new NextResponse('Failed to build export', { status: 500 })
  const data = await (apiRes as any).json()

  const caption = buildCsvCaption(start || null, end || null, asOfIso)
  // After caption and spacer, include CSV-Version metadata line and another spacer, then header
  const rows: string[][] = [['Account', 'Beginning', 'Debits', 'Credits', 'Net Change', 'Ending']]
  const baseCurrency = (db.settings?.baseCurrency as string) || 'USD'
  for (const r of (data.rows as Array<{ account: { number: string; name: string }; beginning: number; debits: number; credits: number; netChange: number; ending: number }>)) {
    rows.push([
      `${r.account.number} \u00b7 ${r.account.name}`,
      formatCurrency(Number(r.beginning) || 0, baseCurrency),
      formatCurrency(Number(r.debits) || 0, baseCurrency),
      formatCurrency(Number(r.credits) || 0, baseCurrency),
      formatCurrency(Number(r.netChange) || 0, baseCurrency),
      formatCurrency(Number(r.ending) || 0, baseCurrency),
    ])
  }
  rows.push([
    'Total',
    formatCurrency(Number(data.totals.beginning) || 0, baseCurrency),
    formatCurrency(Number(data.totals.debits) || 0, baseCurrency),
    formatCurrency(Number(data.totals.credits) || 0, baseCurrency),
    formatCurrency(Number(data.totals.netChange) || 0, baseCurrency),
    formatCurrency(Number(data.totals.ending) || 0, baseCurrency),
  ])

  // Compose CSV with caption row unquoted (tests expect literal),
  // then blank spacer, header + data + totals. Optionally include CSV-Version metadata when requested.
  const csvBody = toCSV(rows)
  const wantCsvVersion = parseCsvVersionFlag(req)
  // Policy: when opted-in, emit CSV-Version as the first row, then caption, blank spacer, then header/body
  const csv = wantCsvVersion
    ? ['CSV-Version,1', caption, '', csvBody].join('\n')
    : [caption, '', csvBody].join('\n')
  const filename = buildCsvFilename('general-ledger-list', { asOfIso })
  return new NextResponse(csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Cache-Control': 'no-store',
    },
  })
}
