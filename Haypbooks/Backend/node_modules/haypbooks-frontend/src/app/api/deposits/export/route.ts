import { NextResponse } from 'next/server'
import { db, seedIfNeeded } from '@/mock/db'
import { getRoleFromCookies, hasPermission } from '@/lib/rbac-server'
import { buildCsvCaption, deriveRange } from '@/lib/report-helpers'
import { buildCsvFilename, sanitizeToken, parseCsvVersionFlag } from '@/lib/csv'
import { todayIso } from '@/lib/date'
import { formatCurrency } from '@/lib/format'
import { GET as JSON_LIST } from '../list/route'

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
  const q = (url.searchParams.get('q') || '').toLowerCase()
  const { start, end } = deriveRange(period, startParam ?? null, endParam ?? null)
  const startOpt = start || undefined
  const endOpt = end || undefined
  // Delegate to sibling JSON route for authoritative filtering/shape (JSON-first)
  // Ensure derived range is reflected in the delegated request
  if (startOpt) url.searchParams.set('start', startOpt); else url.searchParams.delete('start')
  if (endOpt) url.searchParams.set('end', endOpt); else url.searchParams.delete('end')
  if (q) url.searchParams.set('q', q); else url.searchParams.delete('q')
  const jsonResp = await JSON_LIST(new Request(url.toString(), { headers: req.headers }))
  if (!('ok' in jsonResp) || !(jsonResp as any).ok) return jsonResp as any
  const data = await (jsonResp as any).json() as { rows: Array<{ date: string; id: string; depositTo: string; memo: string; payments: number; total: number }> }
  const rows = data.rows || []

  const lines: string[] = []
  // Optional CSV-Version first
  if (versionFlag) lines.push('CSV-Version,1')
  // Caption line with as-of
  lines.push(csvEscape(buildCsvCaption(startOpt || null, endOpt || null, endOpt || todayIso())))
  // Header
  lines.push(['Date', 'Deposit ID', 'Deposit To', 'Memo', 'Payments', 'Total'].map(csvEscape).join(','))
  for (const r of rows) {
    const baseCurrency = (db.settings?.baseCurrency as string) || 'USD'
    lines.push([
      r.date,
      r.id,
      r.depositTo,
      r.memo,
      String(r.payments || 0),
      formatCurrency(Number(r.total) || 0, baseCurrency),
    ].map(csvEscape).join(','))
  }

  const tokens: string[] = []
  if (period) tokens.push(`period-${sanitizeToken(period)}`)
  if (q) tokens.push(`q-${sanitizeToken(q)}`)
  const filename = buildCsvFilename('deposits', { start: startOpt, end: endOpt, asOfIso: endOpt || todayIso(), tokens })
  return new NextResponse(lines.join('\n'), {
    status: 200,
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Cache-Control': 'no-store',
    },
  })
}
