import { NextResponse } from 'next/server'
import { getRoleFromCookies, hasPermission } from '@/lib/rbac-server'
import { deriveRange, buildCsvCaption } from '@/lib/report-helpers'
import { buildCsvFilename, parseCsvVersionFlag } from '@/lib/csv'
import { GET as getJson } from '../route'
import { db } from '@/mock/db'
import { formatCurrency } from '@/lib/format'

function toCSV(rows: string[][]) {
  return rows.map(r => r.map((c) => {
    if (c == null) return ''
    const s = String(c)
    if (s.includes(',') || s.includes('"') || s.includes('\n')) return '"' + s.replace(/"/g, '""') + '"'
    return s
  }).join(',')).join('\n')
}

// No local row generation; delegate to JSON handler for rows/totals.

export async function GET(req: Request) {
  const role = getRoleFromCookies()
  if (!hasPermission(role, 'reports:read')) return new NextResponse('Forbidden', { status: 403 })
  const url = new URL(req.url)
  const versionFlag = parseCsvVersionFlag(req)
  const period = url.searchParams.get('period') || undefined
  const startQ = url.searchParams.get('start')
  const endQ = url.searchParams.get('end')
  const derived = deriveRange(period, startQ, endQ)
  const start = derived.start || startQ
  const end = derived.end || endQ

  // Delegate to JSON source of truth
  const jsonResp = await getJson(req)
  if (!jsonResp.ok) return jsonResp
  const data = await jsonResp.json() as { rows: Array<{ txnId: string; date: string; type: string; number: string; payee: string; memo: string; splitAccount: string; debit: number; credit: number }>; totals?: { debit: number; credit: number }; asOf?: string }
  const asOfIso = (data.asOf || (end || new Date().toISOString())).slice(0, 10)
  const baseCurrency = (db.settings?.baseCurrency as string) || 'USD'

  const csvRows: string[][] = []
  if (versionFlag) csvRows.push(['CSV-Version','1'])
  csvRows.push([buildCsvCaption(start || null, end || null, asOfIso)])
  csvRows.push([])
  csvRows.push(['Txn ID', 'Date', 'Type', 'Number', 'Payee', 'Memo', 'Split Account', 'Debit', 'Credit'])
  for (const r of data.rows) {
    csvRows.push([
      r.txnId,
      r.date,
      r.type,
      r.number,
      r.payee,
      r.memo,
      r.splitAccount,
      formatCurrency(Number(r.debit) || 0, baseCurrency),
      formatCurrency(Number(r.credit) || 0, baseCurrency),
    ])
  }
  if (data.totals) {
    // Totals row must align with header column count (9 columns)
    csvRows.push([
      'Total',
      '',
      '',
      '',
      '',
      '',
      '',
      formatCurrency(Number(data.totals.debit) || 0, baseCurrency),
      formatCurrency(Number(data.totals.credit) || 0, baseCurrency),
    ])
  }

  const csv = toCSV(csvRows)
  // Prefer explicit range; fall back to as-of; support periodized naming when provided
  const filename = period
    ? buildCsvFilename('transaction-list-with-splits', { period, start: start || undefined, end: end || undefined })
    : (start && end)
      ? buildCsvFilename('transaction-list-with-splits', { start, end })
      : buildCsvFilename('transaction-list-with-splits', { asOfIso })
  return new NextResponse(csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Cache-Control': 'no-store',
    },
  })
}
