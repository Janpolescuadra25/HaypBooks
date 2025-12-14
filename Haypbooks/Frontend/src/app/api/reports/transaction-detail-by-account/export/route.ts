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

export async function GET(req: Request) {
  const role = getRoleFromCookies()
  if (!hasPermission(role, 'reports:read')) return new NextResponse('Forbidden', { status: 403 })
  const url = new URL(req.url)
  const versionFlag = parseCsvVersionFlag(req)
    || undefined
  const period = url.searchParams.get('period') || undefined
  const startQ = url.searchParams.get('start')
  const endQ = url.searchParams.get('end')
  const derived = deriveRange(period, startQ, endQ)
  const start = derived.start || startQ
  const end = derived.end || endQ

  // Delegate to JSON handler for single source of truth
  const jsonResp = await getJson(req)
  if (!jsonResp.ok) return jsonResp
  const data = await jsonResp.json() as { rows: Array<{ account: { number: string; name: string }; date: string; memo: string; debit: number; credit: number }>; totals?: { debit: number; credit: number }; asOf?: string }
  const asOfIso = (data.asOf || (end || new Date().toISOString())).slice(0, 10)
  const baseCurrency = (db.settings?.baseCurrency as string) || 'USD'

  const lines: string[][] = []
  if (versionFlag) lines.push(['CSV-Version','1'])
  lines.push([buildCsvCaption(start, end, asOfIso)])
  lines.push([])
  lines.push(['Account', 'Date', 'Memo', 'Debit', 'Credit'])
  for (const r of data.rows) {
    lines.push([
      `${r.account.number} · ${r.account.name}`,
      r.date,
      r.memo,
      formatCurrency(Number(r.debit) || 0, baseCurrency),
      formatCurrency(Number(r.credit) || 0, baseCurrency),
    ])
  }
  if (data.totals) {
    lines.push([
      'Total',
      '',
      '',
      formatCurrency(Number(data.totals.debit) || 0, baseCurrency),
      formatCurrency(Number(data.totals.credit) || 0, baseCurrency),
    ])
  }

  const csv = toCSV(lines)
  const filename = buildCsvFilename('transaction-detail-by-account', { asOfIso })
  return new NextResponse(csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Cache-Control': 'no-store',
    },
  })
}
