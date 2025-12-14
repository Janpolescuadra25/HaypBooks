import { NextResponse } from 'next/server'
import { db } from '@/mock/db'
import { getRoleFromCookies, hasPermission } from '@/lib/rbac-server'
import { buildCsvFilename, sanitizeToken, parseCsvVersionFlag } from '@/lib/csv'
import { buildCsvCaption, deriveRange } from '@/lib/report-helpers'
import { todayIso } from '@/lib/date'
import { formatCurrency } from '@/lib/format'
import { GET as getJson } from '../route'

function csvEscape(v: any): string {
  if (v === null || v === undefined) return ''
  const s = String(v)
  if (/[",\n]/.test(s)) return '"' + s.replace(/"/g, '""') + '"'
  return s
}

export async function GET(req: Request) {
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
  const status = url.searchParams.get('status') || undefined
  const tag = url.searchParams.get('tag') || undefined

  // JSON-first: delegate to sibling JSON route and request a large page size to include all rows
  const jsonUrl = new URL(req.url)
  jsonUrl.searchParams.set('page', '1')
  // High limit to avoid pagination in CSV export
  jsonUrl.searchParams.set('limit', '100000')
  const jsonReq = new Request(jsonUrl.toString(), { method: 'GET', headers: req.headers })
  const jsonRes = await getJson(jsonReq)
  if (!jsonRes.ok) return jsonRes
  const json = await jsonRes.json() as { bills: Array<any> }
  const rows = json.bills.slice()

  const lines: string[] = []
  if (versionFlag) lines.push('CSV-Version,1')
  lines.push(csvEscape(buildCsvCaption(startOpt || null, endOpt || null, endOpt || todayIso())))
  // Header: ensure Status is the 4th column (index 3) as tests expect
  lines.push(['Bill #','Vendor','Due Date','Status','Total','Balance'].map(csvEscape).join(','))
  for (const b of rows) {
    const vendor = (b.vendor || db.vendors.find((v: any) => v.id === b.vendorId)?.name) || b.vendorId
    const baseCurrency = (db.settings?.baseCurrency as string) || 'USD'
    const due = (b.dueDate || '').slice(0, 10)
    lines.push([
      b.number,
      vendor,
      due,
      b.status,
      formatCurrency(Number(b.total) || 0, baseCurrency),
      formatCurrency(Number(b.balance) || 0, baseCurrency),
    ].map(csvEscape).join(','))
  }

  const tokens: string[] = []
  // Do not include status-overdue token (derived filter)
  if (status && status !== 'overdue') tokens.push(`status-${sanitizeToken(status)}`)
  if (tag) tokens.push(`tag-${sanitizeToken(tag)}`)
  if (period) tokens.push(`period-${sanitizeToken(period)}`)
  const filename = buildCsvFilename('bills', { start: startOpt, end: endOpt, asOfIso: endOpt || todayIso(), tokens })
  return new NextResponse(lines.join('\n'), {
    status: 200,
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Cache-Control': 'no-store',
    },
  })
}
