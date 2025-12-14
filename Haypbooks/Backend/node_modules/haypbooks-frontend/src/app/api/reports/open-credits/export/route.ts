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
  // Delegate to JSON-first
  const jsonRes = await getJson(req)
  if (!jsonRes.ok) return jsonRes
  const data = await jsonRes.json() as {
    rows: Array<{ date: string; side: 'ar'|'ap'; number: string; name: string; total: number; applied: number; remaining: number }>
    totals?: { original: number; applied: number; remaining: number }
    start: string | null
    end: string | null
    asOf: string
  }

  const url = new URL(req.url)
  const versionFlag = parseCsvVersionFlag(req)
  const period = url.searchParams.get('period') || undefined
  const customerId = url.searchParams.get('customerId') || undefined
  const vendorId = url.searchParams.get('vendorId') || undefined
  const type = url.searchParams.get('type') as ('ar'|'ap'|null) | null

  const baseCurrency = (db.settings?.baseCurrency as string) || 'USD'
  const lines: string[] = []
  if (versionFlag) lines.push('CSV-Version,1')
  lines.push(csvEscape(buildCsvCaption(data.start, data.end, data.asOf)))
  lines.push(['Date','Side','Number','Name','Original','Applied','Remaining'].map(csvEscape).join(','))
  for (const r of data.rows) {
    lines.push([
      r.date,
      r.side === 'ar' ? 'AR' : 'AP',
      r.number,
      r.name,
      formatCurrency(Number(r.total)||0, baseCurrency),
      formatCurrency(Number(r.applied)||0, baseCurrency),
      formatCurrency(Number(r.remaining)||0, baseCurrency),
    ].map(csvEscape).join(','))
  }

  const tokens: string[] = []
  if (period) tokens.push(`period-${sanitizeToken(period)}`)
  if (type) tokens.push(`type-${sanitizeToken(type)}`)
  if (customerId) tokens.push(`cust-${sanitizeToken(customerId)}`)
  if (vendorId) tokens.push(`ven-${sanitizeToken(vendorId)}`)
  const filename = buildCsvFilename('open-credits', { start: data.start || undefined, end: data.end || undefined, asOfIso: data.asOf, tokens })

  return new NextResponse(lines.join('\n'), {
    status: 200,
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Cache-Control': 'no-store',
    },
  })
}
