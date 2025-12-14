import { NextResponse } from 'next/server'
import { getRoleFromCookies, hasPermission } from '@/lib/rbac-server'
import { deriveRange, buildCsvRangeOrDate } from '@/lib/report-helpers'
import { buildCsvFilename, sanitizeToken, parseCsvVersionFlag } from '@/lib/csv'
import { formatCurrency } from '@/lib/format'
import { db } from '@/mock/db'
import { GET as getJson } from '../route'


function toCSV(rows: string[][]) {
  return rows.map(r => r.map((c) => {
    if (c == null) return ''
    const s = String(c)
    if (s.includes(',') || s.includes('"') || s.includes('\n')) return '"' + s.replace(/"/g, '""') + '"'
    return s
  }).join(',')).join('\n')
}

// generator imported from ../shared

export async function GET(req: Request) {
  const role = getRoleFromCookies()
  if (!hasPermission(role, 'reports:read')) return new NextResponse('Forbidden', { status: 403 })
    const url = new URL(req.url)
    const versionFlag = parseCsvVersionFlag(req)
    const period = url.searchParams.get('period') || undefined
    let start = url.searchParams.get('start')
    let end = url.searchParams.get('end')
    const item = url.searchParams.get('item') || undefined

    // Resolve range via helper for caption/filename parity
    const derived = deriveRange(period, start, end)
    start = derived.start || start
    end = derived.end || end

    // Delegate to sibling JSON handler (JSON-first)
    const jsonRes: any = await getJson(req)
    if (!jsonRes || jsonRes.status !== 200) return new NextResponse('Failed to generate CSV', { status: 500 })
    const { rows, totals, asOf, start: startOut, end: endOut } = await jsonRes.json()
    const asOfIso: string = asOf

    // Deterministic caption: bare ISO range/date or 'As of <ISO>'
    const caption: string[] = [buildCsvRangeOrDate(startOut, endOut, asOfIso)]
    const header = ['Date','Type','Number','Item','Vendor','Qty','Rate','Amount']
    const csvRows: string[][] = [caption, [], header]
    const baseCurrency = (db.settings?.baseCurrency as string) || 'USD'
    for (const r of rows as Array<{ date: string; type: string; number: string; item: string; vendor: string; qty: number; rate: number; amount: number }>) {
      csvRows.push([
        r.date,
        r.type,
        r.number,
        r.item,
        r.vendor,
        String(r.qty),
        formatCurrency(Number(r.rate) || 0, baseCurrency),
        formatCurrency(Number(r.amount) || 0, baseCurrency),
      ])
    }
    csvRows.push([
      'Totals','','','', '',
      String(totals?.qty ?? 0),
      '',
      formatCurrency(Number(totals?.amount ?? 0) || 0, baseCurrency),
    ])

    if (versionFlag) csvRows.unshift(['CSV-Version','1'])

  const csv = toCSV(csvRows)
  return new NextResponse(csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="${buildCsvFilename('purchases-by-product-detail', { asOfIso, tokens: item ? ['item', sanitizeToken(item)] : undefined })}"`,
      'Cache-Control': 'no-store',
    },
  })
}
