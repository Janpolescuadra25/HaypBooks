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
  const versionFlag = parseCsvVersionFlag(req)
  const period = url.searchParams.get('period') || undefined
  const startParam = url.searchParams.get('start') || undefined
  const endParam = url.searchParams.get('end') || undefined
  const { start, end } = deriveRange(period, startParam ?? null, endParam ?? null)
  const startOpt = start || undefined
  const endOpt = end || undefined
  const accountId = url.searchParams.get('accountId') || undefined
  const tag = url.searchParams.get('tag') || undefined

  // JSON-first: delegate to sibling JSON handler with derived filters
  if (startOpt) url.searchParams.set('start', startOpt); else url.searchParams.delete('start')
  if (endOpt) url.searchParams.set('end', endOpt); else url.searchParams.delete('end')
  if (accountId) url.searchParams.set('accountId', accountId); else url.searchParams.delete('accountId')
  if (tag) url.searchParams.set('tag', tag); else url.searchParams.delete('tag')
  const jsonResp = await JSON_GET(new Request(url.toString(), { headers: req.headers }))
  if (!('ok' in jsonResp) || !(jsonResp as any).ok) return jsonResp as any
  const data = await (jsonResp as any).json() as { excluded: Array<{ id: string; date: string; description: string; amount: number; accountNumber?: string; accountName?: string; exclusionTs?: string; exclusionMethod?: string; exclusionActor?: string; exclusionRuleName?: string }>; total: number }

  const lines: string[] = []
  if (versionFlag) lines.push('CSV-Version,1')
  lines.push(csvEscape(buildCsvCaption(startOpt || null, endOpt || null, endOpt || todayIso())))
  lines.push(['Txn Date','Description','Amount','Account','Excluded At','Method','Rule','Actor'].map(csvEscape).join(','))
  const baseCurrency = (db.settings?.baseCurrency as string) || 'USD'
  for (const r of data.excluded) {
    const when = (r.exclusionTs || '').slice(0,19).replace('T',' ')
    const acct = r.accountNumber && r.accountName ? `${r.accountNumber} ${r.accountName}` : (r.accountNumber || r.accountName || '')
    lines.push([
      r.date,
      r.description,
      formatCurrency(Number(r.amount) || 0, baseCurrency),
      acct,
      when,
      r.exclusionMethod || '',
      r.exclusionRuleName || '',
      r.exclusionActor || '',
    ].map(csvEscape).join(','))
  }

  const tokens: string[] = []
  tokens.push('bank-excluded')
  if (accountId) tokens.push(`acct-${sanitizeToken(accountId)}`)
  if (tag) tokens.push(`tag-${sanitizeToken(tag)}`)
  if (period) tokens.push(`period-${sanitizeToken(period)}`)
  const filename = buildCsvFilename('transactions-audit', { start: startOpt, end: endOpt, asOfIso: endOpt || todayIso(), tokens })
  return new NextResponse(lines.join('\n'), {
    status: 200,
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Cache-Control': 'no-store',
    },
  })
}
