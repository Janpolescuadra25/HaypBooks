import { NextResponse } from 'next/server'
import { db, seedIfNeeded } from '@/mock/db'
import { buildCsvFilename, sanitizeToken, parseCsvVersionFlag } from '@/lib/csv'
import { buildCsvCaption } from '@/lib/report-helpers'
import { formatCurrency } from '@/lib/format'
import { GET as getJson } from '../route'

function csvEscape(v: any): string {
  if (v === null || v === undefined) return ''
  const s = String(v)
  if (/[",\n]/.test(s)) return '"' + s.replace(/"/g, '""') + '"'
  return s
}

export async function GET(req: Request) {
  if (!db.seeded) { try { seedIfNeeded() } catch {} }
  // Delegate to JSON-first route to inherit RBAC, filters, and totals logic
  const jsonRes = await getJson(req)
  if (!jsonRes.ok) return jsonRes
  const data = await jsonRes.json() as {
    rows: Array<{ vendor: string; transactions: number; qty: number; amount: number }>
    totals: { amount: number; qty: number; transactions: number }
    start: string | null
    end: string | null
    asOf: string
    period?: string | null
  }

  const url = new URL(req.url)
  const versionFlag = parseCsvVersionFlag(req)
  const period = url.searchParams.get('period') || undefined
  const tag = url.searchParams.get('tag') || undefined

  const baseCurrency = (db.settings?.baseCurrency as string) || 'USD'
  const lines: string[] = []
  if (versionFlag) lines.push('CSV-Version,1')
  lines.push(csvEscape(buildCsvCaption(data.start || undefined, data.end || undefined, data.asOf)))
  lines.push(['Vendor','Transactions','Qty','Amount'].map(csvEscape).join(','))
  for (const r of data.rows) {
    lines.push([
      r.vendor,
      String(r.transactions ?? 0),
      String(r.qty ?? 0),
      formatCurrency(Number(r.amount || 0), baseCurrency),
    ].map(csvEscape).join(','))
  }
  lines.push([
    'Totals',
    String(data.totals?.transactions ?? 0),
    String(data.totals?.qty ?? 0),
    formatCurrency(Number(data.totals?.amount || 0), baseCurrency),
  ].map(csvEscape).join(','))

  const tokens: string[] = []
  if (period) tokens.push(`period-${sanitizeToken(period)}`)
  if (tag) tokens.push(`tag-${sanitizeToken(tag)}`)
  const filename = buildCsvFilename('expenses-by-vendor-summary', {
    start: data.start || undefined,
    end: data.end || undefined,
    asOfIso: data.asOf,
    tokens,
  })

  return new NextResponse(lines.join('\n'), {
    status: 200,
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Cache-Control': 'no-store',
    },
  })
}
