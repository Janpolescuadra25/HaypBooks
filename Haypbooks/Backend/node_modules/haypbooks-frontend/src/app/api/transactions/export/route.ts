import { NextResponse } from 'next/server'
import { db, seedIfNeeded } from '@/mock/db'
import { getRoleFromCookies, hasPermission } from '@/lib/rbac-server'
import { buildCsvFilename, sanitizeToken, parseCsvVersionFlag } from '@/lib/csv'
import { buildCsvCaption, deriveRange } from '@/lib/report-helpers'
import { todayIso } from '@/lib/date'
import { formatCurrency } from '@/lib/format'
import { GET as JSON_GET } from '../route'

function csvEscape(v: any): string {
  if (v === null || v === undefined) return ''
  const s = String(v)
  if (/[",\n]/.test(s)) return '"' + s.replace(/"/g, '""') + '"'
  return s
}

export async function GET(req: Request) {
  if (!db.seeded) { try { seedIfNeeded() } catch {} }
  const role = getRoleFromCookies()
  if (!hasPermission(role, 'reports:read')) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const url = new URL(req.url)
  // CSV-Version opt-in using shared parser
  const versionFlag = parseCsvVersionFlag(req)
  const period = url.searchParams.get('period') || undefined
  const startParam = url.searchParams.get('start') || undefined
  const endParam = url.searchParams.get('end') || undefined
  const { start, end } = deriveRange(period, startParam ?? null, endParam ?? null)
  const startOpt = start || undefined
  const endOpt = end || undefined
  const type = url.searchParams.get('type') || undefined
  const bankStatus = url.searchParams.get('bankStatus') || undefined
  const accountId = url.searchParams.get('accountId') || undefined
  const tag = url.searchParams.get('tag') || undefined
  // JSON-first: delegate to sibling JSON handler with derived filters and a large limit
  if (startOpt) url.searchParams.set('start', startOpt); else url.searchParams.delete('start')
  if (endOpt) url.searchParams.set('end', endOpt); else url.searchParams.delete('end')
  if (type) url.searchParams.set('type', type); else url.searchParams.delete('type')
  if (bankStatus) url.searchParams.set('bankStatus', bankStatus); else url.searchParams.delete('bankStatus')
  if (accountId) url.searchParams.set('accountId', accountId); else url.searchParams.delete('accountId')
  if (tag) url.searchParams.set('tag', tag); else url.searchParams.delete('tag')
  url.searchParams.set('page', '1')
  url.searchParams.set('limit', '1000000')
  const jsonResp = await JSON_GET(new Request(url.toString(), { headers: req.headers }))
  if (!('ok' in jsonResp) || !(jsonResp as any).ok) return jsonResp as any
  const data = await (jsonResp as any).json() as { transactions: Array<{ date: string; description: string; category: string; amount: number; bankStatus?: string; source?: string }>; total: number }
  const rows = data.transactions.map(t => ({ ...t, d: (t.date || '').slice(0,10) }))

  const lines: string[] = []
  if (versionFlag) lines.push('CSV-Version,1')
  lines.push(csvEscape(buildCsvCaption(startOpt || null, endOpt || null, endOpt || todayIso())))
  lines.push(['Date','Description','Category','Amount','Bank Status','Source'].map(csvEscape).join(','))
  for (const t of rows) {
    const baseCurrency = (db.settings?.baseCurrency as string) || 'USD'
    lines.push([
      t.d,
      t.description,
      t.category,
      formatCurrency(Number(t.amount) || 0, baseCurrency),
      t.bankStatus || 'for_review',
      t.source || 'import',
    ].map(csvEscape).join(','))
  }

  const tokens: string[] = []
  if (type) tokens.push(`type-${sanitizeToken(type)}`)
  if (bankStatus) tokens.push(`bank-${sanitizeToken(bankStatus)}`)
  if (accountId) tokens.push(`acct-${sanitizeToken(accountId)}`)
  if (tag) tokens.push(`tag-${sanitizeToken(tag)}`)
  if (period) tokens.push(`period-${sanitizeToken(period)}`)
  const filename = buildCsvFilename('transactions', { start: startOpt, end: endOpt, asOfIso: endOpt || todayIso(), tokens })
  return new NextResponse(lines.join('\n'), {
    status: 200,
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Cache-Control': 'no-store',
    },
  })
}
