import { NextResponse } from 'next/server'
import { getRoleFromCookies, hasPermission } from '@/lib/rbac-server'
import { buildCsvFilename, parseCsvVersionFlag } from '@/lib/csv'
import { deriveRange, buildCsvRangeOrDate } from '@/lib/report-helpers'
import { GET as getJson } from '../route'
import { db } from '@/mock/db'
import { buildAgingDetailCsvRows, toCSV } from '@/lib/reports/aging-csv'

export async function GET(req: Request) {
  const role = getRoleFromCookies()
  if (!hasPermission(role, 'reports:read')) return new NextResponse('Forbidden', { status: 403 })
  const url = new URL(req.url)
  // CSV-Version opt-in (aliases accepted)
  const versionFlag = parseCsvVersionFlag(req)
  const period = url.searchParams.get('period') || undefined
  let start = url.searchParams.get('start')
  let end = url.searchParams.get('end')
  const derived = deriveRange(period, start, end)
  start = derived.start || start
  end = derived.end || end
  const jsonResp = await getJson(req)
  if (!jsonResp.ok) return jsonResp
  const data = await jsonResp.json() as { rows: Array<{ vendor: string; type: string; number: string; billDate: string; dueDate: string; aging: number; openBalance: number }>; totals?: { openBalance: number }; asOf?: string }
  const asOfIso = (data.asOf || (end || new Date().toISOString())).slice(0, 10)
  // Caption uses bare ISO range/date for determinism; falls back to As of ISO when none provided
  const captionRow: string[] = [buildCsvRangeOrDate(start, end, asOfIso)]
  const baseCurrency = (db.settings?.baseCurrency as string) || 'USD'
  const csvRows = buildAgingDetailCsvRows({
    caption: captionRow[0],
    includeVersionRow: !!versionFlag,
    entityLabel: 'Vendor',
    dateHeaderLabel: 'Bill Date',
    rows: (data.rows || []).map(r => ({
      entityName: r.vendor,
      type: r.type,
      number: r.number,
      date: r.billDate,
      dueDate: r.dueDate,
      aging: r.aging,
      openBalance: r.openBalance,
    })),
    totalsOpenBalance: data.totals?.openBalance,
    baseCurrency,
  })
  const csv = toCSV(csvRows)
  const filename = buildCsvFilename('ap-aging-detail', { asOfIso })
  return new NextResponse(csv, { headers: { 'Content-Type': 'text/csv; charset=utf-8', 'Content-Disposition': `attachment; filename="${filename}"` } })
}
