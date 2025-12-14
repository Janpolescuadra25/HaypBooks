import { NextResponse } from 'next/server'
import { getRoleFromCookies, hasPermission } from '@/lib/rbac-server'
import { parseCsvVersionFlag, buildCsvFilename } from '@/lib/csv'
import { deriveRange } from '@/lib/report-helpers'
import { db } from '@/mock/db'
import { formatAsOf } from '@/lib/date'
import { GET as JSON_GET } from '../route'
import { buildAgingSummaryCsvRows, toCSV } from '@/lib/reports/aging-csv'


export async function GET(req: Request) {
  const role = getRoleFromCookies()
  if (!hasPermission(role, 'reports:read')) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  const url = new URL(req.url)
  const period = url.searchParams.get('period') || undefined
  const startParam = url.searchParams.get('start') || undefined
  const endParam = url.searchParams.get('end') || undefined
  const { start, end } = deriveRange(period, startParam ?? null, endParam ?? null)
  if (start) url.searchParams.set('start', start); else url.searchParams.delete('start')
  if (end) url.searchParams.set('end', end); else url.searchParams.delete('end')
  const versionFlag = parseCsvVersionFlag(req)

  const jsonResp = await JSON_GET(new Request(url.toString(), { headers: req.headers })) as any
  if (!(jsonResp as any).ok) return jsonResp
  const data = await (jsonResp as any).json() as { start: string | null; end: string | null; asOf: string; rows: any[]; totals: any }
  const baseCurrency = (db.settings?.baseCurrency as string) || 'USD'

  const asOfIso = (data.asOf || data.end || new Date().toISOString().slice(0,10))
  const csvRows = buildAgingSummaryCsvRows({
    entityLabel: 'Customer',
    asOfIso,
    rows: data.rows as any,
    totals: data.totals as any,
    baseCurrency,
    includeVersionRow: !!versionFlag,
  })

  const tokens: string[] = []
  if (period) tokens.push(period)
  const filename = buildCsvFilename('ar-aging', { asOfIso: asOfIso || undefined, tokens, tokenPosition: 'before' })
  const csv = toCSV(csvRows)
  return new NextResponse(csv, { status: 200, headers: { 'Content-Type': 'text/csv; charset=utf-8', 'Content-Disposition': `attachment; filename="${filename}"`, 'Cache-Control': 'no-store' } })
}
