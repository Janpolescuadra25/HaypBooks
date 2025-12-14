import { NextResponse } from 'next/server'
import { getRoleFromCookies, hasPermission } from '@/lib/rbac-server'
import { db, seedIfNeeded } from '@/mock/db'
import { parseCsvVersionFlag, buildCsvFilename } from '@/lib/csv'
import { buildCsvCaption, deriveRange } from '@/lib/report-helpers'
import { todayIso } from '@/lib/date'
import { formatCurrency } from '@/lib/format'
import { GET as JSON_GET } from '../route'

function csvEscape(v: any): string { if (v === null || v === undefined) return ''; const s = String(v); return /[",\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s }

export async function GET(req: Request) {
  if (!db.seeded) { try { seedIfNeeded() } catch {} }
  const role = getRoleFromCookies()
  // Require both audit:read and reports:read per tests
  if (!hasPermission(role, 'audit:read') || !hasPermission(role, 'reports:read')) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const url = new URL(req.url)
  const versionFlag = parseCsvVersionFlag(req)
  const period = url.searchParams.get('period') || undefined
  const startParam = url.searchParams.get('start') || undefined
  const endParam = url.searchParams.get('end') || undefined
  const { start, end } = deriveRange(period, startParam ?? null, endParam ?? null)
  if (start) url.searchParams.set('start', start); else url.searchParams.delete('start')
  if (end) url.searchParams.set('end', end); else url.searchParams.delete('end')

  // Delegate to JSON route to get history rows
  const jsonResp = await JSON_GET(new Request(url.toString(), { headers: req.headers }))
  if (!('ok' in jsonResp) || !(jsonResp as any).ok) return jsonResp as any
  const data = await (jsonResp as any).json() as { start: string | null; end: string | null; history: { count: number; rows: Array<{ date: string; customer: string; invoice: string; paymentId: string; amount: number; remainingBalance: number; method?: string; batchId?: string }> } }

  const baseCurrency = (db.settings?.baseCurrency as string) || 'USD'
  const lines: string[] = []
  if (versionFlag) lines.push('CSV-Version,1')
  lines.push(csvEscape(buildCsvCaption(data.start, data.end, data.end || todayIso())))
  lines.push(['Date','Customer','Invoice','Payment Id','Applied Amount','Remaining Balance','Method','Batch Id'].map(csvEscape).join(','))
  for (const r of data.history.rows) {
    lines.push([
      r.date,
      r.customer || '',
      r.invoice || '',
      r.paymentId || '',
      formatCurrency(Number(r.amount)||0, baseCurrency),
      formatCurrency(Number(r.remainingBalance)||0, baseCurrency),
      r.method || '',
      r.batchId || '',
    ].map(csvEscape).join(','))
  }
  const filename = buildCsvFilename('payment-applications-history', { start: data.start || undefined, end: data.end || undefined, asOfIso: data.end || todayIso() })
  return new NextResponse(lines.join('\n'), { status: 200, headers: { 'Content-Type': 'text/csv; charset=utf-8', 'Content-Disposition': `attachment; filename="${filename}"`, 'Cache-Control': 'no-store' } })
}

