import { NextResponse } from 'next/server'
import { getRoleFromCookies, hasPermission } from '@/lib/rbac-server'
import { deriveRange, buildCsvRangeOrDate } from '@/lib/report-helpers'
import { buildCsvFilename, parseCsvVersionFlag } from '@/lib/csv'
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
  const url = new URL(req.url)
  const period = url.searchParams.get('period') || undefined
  let start = url.searchParams.get('start')
  let end = url.searchParams.get('end')
  const derived = deriveRange(period, start, end)
  start = derived.start || start
  end = derived.end || end
  const jsonRes: any = await getJson(req)
  if (!jsonRes || jsonRes.status !== 200) return new NextResponse('Failed to generate CSV', { status: 500 })
  const { rows, totals, asOf } = await jsonRes.json()
  const asOfIso: string = asOf
  const baseCurrency = (db.settings?.baseCurrency as string) || 'USD'

  const captionRow: string[] = [buildCsvRangeOrDate(start, end, asOfIso)]
  const headerRow = ['Customer','Open','Kept','Broken','Kept On-Time %','Avg Days to Keep','Open Exposure','Broken Exposure','Next Promise Date','Promise Aging Days']
  const includeVersion = parseCsvVersionFlag(req)
  const csvRows: string[][] = includeVersion
    ? [["CSV-Version","1"], captionRow, [], headerRow]
    : [captionRow, [], headerRow]
  for (const r of rows as Array<{ customer: string; open: number; kept: number; broken: number; keptOnTimePct: number; avgDaysToKeep: number | null; openExposure: number; brokenExposure: number; nextPromiseDate?: string | null; promiseAgingDays?: number | null }>) {
    csvRows.push([
      r.customer,
      String(r.open || 0),
      String(r.kept || 0),
      String(r.broken || 0),
      String(r.keptOnTimePct ?? 0),
      r.avgDaysToKeep == null ? '' : String(r.avgDaysToKeep),
      formatCurrency(Number(r.openExposure || 0), baseCurrency),
      formatCurrency(Number(r.brokenExposure || 0), baseCurrency),
      r.nextPromiseDate || '',
      r.promiseAgingDays == null ? '' : String(r.promiseAgingDays),
    ])
  }
  // Totals: counts and exposures; keptOnTimePct from totals
  const totalOpen = Number(totals?.open ?? 0)
  const totalKept = Number(totals?.kept ?? 0)
  const totalBroken = Number(totals?.broken ?? 0)
  const totalOpenExposure = Number(totals?.openExposure ?? 0)
  const totalBrokenExposure = Number(totals?.brokenExposure ?? 0)
  const keptOnTimePct = Number(totals?.keptOnTimePct ?? 0)
  csvRows.push([
    'Totals',
    String(totalOpen),
    String(totalKept),
    String(totalBroken),
    String(keptOnTimePct),
    '',
    formatCurrency(totalOpenExposure, baseCurrency),
    formatCurrency(totalBrokenExposure, baseCurrency),
    '',
    '',
  ])

  const csv = toCSV(csvRows)
  const filename = buildCsvFilename('promise-performance', { asOfIso })
  return new NextResponse(csv, { headers: { 'Content-Type': 'text/csv; charset=utf-8', 'Content-Disposition': `attachment; filename="${filename}"` } })
}
