import { NextResponse } from 'next/server'
import { getRoleFromCookies, hasPermission } from '@/lib/rbac-server'
import { buildCsvFilename, parseCsvVersionFlag } from '@/lib/csv'
import { GET as JSON_GET } from '../route'
import { db } from '@/mock/db'
import { buildAgingSummaryCsvRows, toCSV } from '@/lib/reports/aging-csv'

export async function GET(req: Request) {
  const role = getRoleFromCookies()
  if (!hasPermission(role, 'reports:read')) return new NextResponse('Forbidden', { status: 403 })
  // Derive as-of from typical summary params (prefer end -> asOf -> today)
  const reqUrl = new URL(req.url)
  // CSV-Version opt-in via aliases
  const versionFlag = parseCsvVersionFlag(req)
  const periodParam = reqUrl.searchParams.get('period') || undefined
  const endParam = reqUrl.searchParams.get('end')
  const asOfParam = reqUrl.searchParams.get('asOf')
  const asOfIso = (endParam || asOfParam || new Date().toISOString().slice(0,10))
  // Call JSON endpoint with explicit asOf so aging uses requested date
  const jsonUrl = new URL('http://localhost/api/reports/ap-aging')
  for (const [k, v] of reqUrl.searchParams.entries()) jsonUrl.searchParams.set(k, v)
  jsonUrl.searchParams.set('asOf', asOfIso)
  const jsonRes: any = await JSON_GET(new Request(jsonUrl.toString()))
  if (!jsonRes || jsonRes.status !== 200) return new NextResponse('Failed to generate CSV', { status: 500 })
  const { rows, totals } = await jsonRes.json()
  const baseCurrency = (db.settings?.baseCurrency as string) || 'USD'
  const csvRows = buildAgingSummaryCsvRows({
    entityLabel: 'Vendor',
    asOfIso,
    rows,
    totals,
    baseCurrency,
    includeVersionRow: !!versionFlag,
  })
  const csv = toCSV(csvRows)
  const filename = buildCsvFilename('ap-aging', { asOfIso, tokens: periodParam ? [periodParam] : undefined, tokenPosition: 'before' })
  return new NextResponse(csv, { headers: { 'Content-Type': 'text/csv; charset=utf-8', 'Content-Disposition': `attachment; filename="${filename}"` } })
}
