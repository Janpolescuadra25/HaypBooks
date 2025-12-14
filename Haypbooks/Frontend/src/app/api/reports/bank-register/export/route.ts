import { NextResponse } from 'next/server'
import { getRoleFromCookies, hasPermission } from '@/lib/rbac-server'
import { buildCsvFilename, parseCsvVersionFlag } from '@/lib/csv'
import { buildCsvCaption, deriveRange } from '@/lib/report-helpers'
import { todayIso } from '@/lib/date'
import { formatCurrency } from '@/lib/format'
import { db } from '@/mock/db'
import { GET as JSON_GET } from '../route'

function csvEscape(v: any): string { if (v === null || v === undefined) return ''; const s = String(v); return /[",\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s }

export async function GET(req: Request) {
  const role = getRoleFromCookies()
  if (!hasPermission(role, 'reports:read')) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  const url = new URL(req.url)
  const versionFlag = parseCsvVersionFlag(req)
  const period = url.searchParams.get('period') || undefined
  const startParam = url.searchParams.get('start') || undefined
  const endParam = url.searchParams.get('end') || undefined
  const { start, end } = deriveRange(period, startParam ?? null, endParam ?? null)
  if (start) url.searchParams.set('start', start); else url.searchParams.delete('start')
  if (end) url.searchParams.set('end', end); else url.searchParams.delete('end')
  // Delegate to JSON for data
  const jsonResp = await JSON_GET(new Request(url.toString(), { headers: req.headers }))
  if (!('ok' in jsonResp) || !(jsonResp as any).ok) return jsonResp as any
  const data = await (jsonResp as any).json() as { account: any; start: string | null; end: string | null; openingBalance: number; closingBalance: number; rows: any[] }
  const baseCurrency = (db.settings?.baseCurrency as string) || 'USD'
  const lines: string[] = []
  if (versionFlag) lines.push('CSV-Version,1')
  lines.push(csvEscape(buildCsvCaption(data.start, data.end, data.end || todayIso())))
  lines.push(['Date','Description','Amount','Running Balance','Bank Status','Cleared','Reconciled','Matched'].map(csvEscape).join(','))
  for (const r of data.rows) {
    lines.push([
      r.date,
      r.description,
      formatCurrency(Number(r.amount)||0, baseCurrency),
      formatCurrency(Number(r.runningBalance)||0, baseCurrency),
      r.bankStatus || 'for_review',
      r.cleared ? 'Yes' : 'No',
      r.reconciled ? 'Yes' : 'No',
      r.matchedRef ? `${r.matchedKind || ''} ${r.matchedRef}`.trim() : '',
    ].map(csvEscape).join(','))
  }
  const acctToken = data.account?.number ? `acct-${data.account.number}` : 'acct'
  const filename = buildCsvFilename('bank-register', { start: data.start || undefined, end: data.end || undefined, asOfIso: data.end || todayIso(), tokens: [acctToken] })
  return new NextResponse(lines.join('\n'), { status: 200, headers: { 'Content-Type': 'text/csv; charset=utf-8', 'Content-Disposition': `attachment; filename="${filename}"`, 'Cache-Control': 'no-store' } })
}
