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
  // CSV-Version opt-in via multiple alias flags
  // CSV-Version opt-in using shared parser
  const versionFlag = parseCsvVersionFlag(req)
  const period = url.searchParams.get('period') || undefined
  const startParam = url.searchParams.get('start') || undefined
  const endParam = url.searchParams.get('end') || undefined
  const { start, end } = deriveRange(period, startParam ?? null, endParam ?? null)
  const startOpt = start || undefined
  const endOpt = end || undefined
  const status = url.searchParams.get('status') || undefined
  const tag = url.searchParams.get('tag') || undefined

  // JSON-first: delegate to sibling JSON handler for authoritative data
  // Ensure derived start/end are propagated; request an effectively unbounded page size
  if (startOpt) url.searchParams.set('start', startOpt); else url.searchParams.delete('start')
  if (endOpt) url.searchParams.set('end', endOpt); else url.searchParams.delete('end')
  url.searchParams.set('page', '1')
  url.searchParams.set('limit', '1000000')
  const jsonResp = await JSON_GET(new Request(url.toString(), { headers: req.headers }))
  if (!('ok' in jsonResp) || !(jsonResp as any).ok) return jsonResp as any
  const data = await (jsonResp as any).json() as { invoices: Array<{ number: string; customer: string; status: string; date?: string; dueDate?: string; total: number; balance: number }>; total: number }
  const rows = data.invoices

  const lines: string[] = []
  // Optional CSV-Version metadata first
  if (versionFlag) lines.push('CSV-Version,1')
  // Caption row
  lines.push(csvEscape(buildCsvCaption(startOpt || null, endOpt || null, endOpt || todayIso())))
  // Header
  lines.push(['Invoice #','Customer','Status','Date','Due Date','Total','Balance'].map(csvEscape).join(','))
  for (const inv of rows) {
    const customer = inv.customer
    const baseCurrency = (db.settings?.baseCurrency as string) || 'USD'
    lines.push([
      inv.number,
      customer,
      inv.status,
      inv.date?.slice(0,10) || '',
      inv.dueDate?.slice(0,10) || '',
      formatCurrency(Number(inv.total) || 0, baseCurrency),
      formatCurrency(Number(inv.balance) || 0, baseCurrency),
    ].map(csvEscape).join(','))
  }

  const tokens: string[] = []
  if (status) tokens.push(`status-${sanitizeToken(status)}`)
  if (tag) tokens.push(`tag-${sanitizeToken(tag)}`)
  if (period) tokens.push(`period-${sanitizeToken(period)}`)
  const filename = buildCsvFilename('invoices', { start: startOpt, end: endOpt, asOfIso: endOpt || todayIso(), tokens })
  return new NextResponse(lines.join('\n'), {
    status: 200,
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Cache-Control': 'no-store',
    },
  })
}
