import { NextResponse } from 'next/server'
import { buildCsvCaption } from '@/lib/report-helpers'
import { buildCsvFilename, parseCsvVersionFlag, sanitizeToken } from '@/lib/csv'
import { formatCurrency } from '@/lib/format'
import { db } from '@/mock/db'
import { GET as getJson } from '../route'

function csvEscape(v: any): string {
  if (v === null || v === undefined) return ''
  const s = String(v)
  if (/[",\n]/.test(s)) return '"' + s.replace(/"/g, '""') + '"'
  return s
}

export async function GET(req: Request) {
  // Delegate to JSON-first
  const jsonRes = await getJson(req)
  if (!jsonRes.ok) return jsonRes
  const data = await jsonRes.json() as {
    rows: Array<{ date: string; number: string; customer: string; memo: string; amount: number; openBalance: number }>
    totals: { amount: number; openBalance: number }
    start: string | null
    end: string | null
    asOf: string
  }

  const url = new URL(req.url)
  const versionFlag = parseCsvVersionFlag(req)
  const period = url.searchParams.get('period') || undefined
  const baseCurrency = (db.settings?.baseCurrency as string) || 'USD'

  const lines: string[] = []
  if (versionFlag) lines.push('CSV-Version,1')
  lines.push(csvEscape(buildCsvCaption(data.start || undefined, data.end || undefined, data.asOf)))
  lines.push(['Date','Invoice #','Customer','Memo','Amount','Open Balance'].map(csvEscape).join(','))
  for (const r of data.rows) {
    lines.push([
      r.date,
      r.number,
      r.customer,
      r.memo,
      formatCurrency(Number(r.amount)||0, baseCurrency),
      formatCurrency(Number(r.openBalance)||0, baseCurrency),
    ].map(csvEscape).join(','))
  }
  lines.push([
    'Total','', '', '',
    formatCurrency(Number(data.totals?.amount)||0, baseCurrency),
    formatCurrency(Number(data.totals?.openBalance)||0, baseCurrency),
  ].map(csvEscape).join(','))

  const tokens: string[] = []
  if (period) tokens.push(`period-${sanitizeToken(period)}`)
  const filename = buildCsvFilename('invoice-list-by-date', { asOfIso: data.asOf, start: data.start || undefined, end: data.end || undefined, tokens })
  return new NextResponse(lines.join('\n'), {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Cache-Control': 'no-store',
    },
  })
}
