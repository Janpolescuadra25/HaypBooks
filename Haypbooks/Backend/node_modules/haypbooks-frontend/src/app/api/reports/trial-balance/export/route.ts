import { NextResponse } from 'next/server'
import { buildCsvCaption, deriveRange } from '@/lib/report-helpers'
import { buildCsvFilename, parseCsvVersionFlag } from '@/lib/csv'
import { GET as GET_API } from '../route'
import { formatCurrency } from '@/lib/format'
import { db } from '@/mock/db'
import { getRoleFromCookies, hasPermission } from '@/lib/rbac-server'

export async function GET(req: Request) {
  // Enforce RBAC early to avoid masking 403 as 500
  const role = getRoleFromCookies()
  if (!hasPermission(role, 'reports:read')) {
    return new NextResponse('Forbidden', { status: 403 })
  }
  const url = new URL(req.url)
  const versionFlag = parseCsvVersionFlag(req)
  const period = url.searchParams.get('period') || 'Custom'
  const startParam = url.searchParams.get('start')
  const endParam = url.searchParams.get('end')
  const { start, end } = deriveRange(period, startParam, endParam)
  const asOfIso = end || new Date().toISOString().slice(0, 10)
  const apiUrl = new URL(req.url)
  apiUrl.pathname = apiUrl.pathname.replace('/export', '')
  // Call the API handler directly to avoid network fetch in test/runtime
  const res: any = await GET_API(new Request(apiUrl.toString()))
  if (!res || res.status !== 200) {
    // Pass through upstream error status when available
    return new NextResponse('Failed to build export', { status: res?.status || 500 })
  }
  const data = await (res as any).json()

  // Local CSV helper for quoting
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

  const rows: string[][] = []
  if (versionFlag) rows.push(['CSV-Version','1'])
  rows.push([buildCsvCaption(start || null, end || null, asOfIso)])
  // blank spacer line for consistency with other CSV exports
  rows.push([''])
  rows.push(['Account', 'Name', 'Debit', 'Credit'])
  const baseCurrency = (db.settings?.baseCurrency as string) || 'USD'
  for (const r of data.rows as Array<{ number: string; name: string; debit: number; credit: number }>) {
    const deb = formatCurrency(Number(r.debit || 0), baseCurrency).replace(/,/g, '')
    const cr = formatCurrency(Number(r.credit || 0), baseCurrency).replace(/,/g, '')
    rows.push([r.number, r.name, deb, cr])
  }
  rows.push(['', 'Totals', formatCurrency(Number(data.totals.debit || 0), baseCurrency).replace(/,/g, ''), formatCurrency(Number(data.totals.credit || 0), baseCurrency).replace(/,/g, '')])

  const csv = toCSV(rows)
  const filename = buildCsvFilename('trial-balance', { asOfIso })
  return new NextResponse(csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="${filename}"`,
    },
  })
}
