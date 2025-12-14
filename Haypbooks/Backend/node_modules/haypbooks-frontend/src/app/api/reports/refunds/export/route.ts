import { NextResponse } from 'next/server'
import { buildCsvCaption } from '@/lib/report-helpers'
import { buildCsvFilename, sanitizeToken, parseCsvVersionFlag } from '@/lib/csv'
import { db, seedIfNeeded } from '@/mock/db'
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
  // Delegate to JSON route to ensure single source of truth for data, RBAC, and filters
  const jsonRes = await getJson(req)
  if (!jsonRes.ok) return jsonRes
  const payload = await jsonRes.json() as {
    rows: Array<{ date: string; amount: number; method?: string; reference?: string; type: 'ar'|'ap'; linkId?: string|null }>
    totals?: { count: number; amount: number }
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
  lines.push(csvEscape(buildCsvCaption(payload.start, payload.end, payload.asOf)))
  lines.push(['Date','Side','Amount','Method','Reference','Linked Credit'].map(csvEscape).join(','))
  for (const r of payload.rows) {
    lines.push([
      r.date,
      r.type === 'ar' ? 'AR' : 'AP',
      formatCurrency(Number(r.amount)||0, baseCurrency),
      r.method || '',
      r.reference || '',
      r.linkId ? 'Credit' : '',
    ].map(csvEscape).join(','))
  }

  const tokens: string[] = []
  if (period) tokens.push(`period-${sanitizeToken(period)}`)
  if (type) tokens.push(`type-${sanitizeToken(type)}`)
  if (customerId) tokens.push(`cust-${sanitizeToken(customerId)}`)
  if (vendorId) tokens.push(`ven-${sanitizeToken(vendorId)}`)
  const filename = buildCsvFilename('refunds', { start: payload.start || undefined, end: payload.end || undefined, asOfIso: payload.asOf, tokens })

  return new NextResponse(lines.join('\n'), {
    status: 200,
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Cache-Control': 'no-store',
    },
  })
}
