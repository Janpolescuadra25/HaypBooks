import { NextResponse } from 'next/server'
import { buildCsvFilename, parseCsvVersionFlag, sanitizeToken } from '@/lib/csv'
import { buildCsvCaption, deriveRange } from '@/lib/report-helpers'
import { todayIso } from '@/lib/date'
import { formatCurrency } from '@/lib/format'
import { db, seedIfNeeded } from '@/mock/db'
import { GET as JSON_LIST } from '../route'

function csvEscape(v: any): string {
  if (v === null || v === undefined) return ''
  const s = String(v)
  if (/[",\n]/.test(s)) return '"' + s.replace(/"/g, '""') + '"'
  return s
}

export async function GET(req: Request) {
  try { seedIfNeeded() } catch {}
  const hasReq = !!(req as any)
  const url = hasReq && (req as any).url ? new URL((req as any).url) : new URL('http://local/api/receipts/export')
  const versionFlag = parseCsvVersionFlag(hasReq ? (req as any) : url)
  // Normalize range/search params for JSON-first delegation
  const period = url.searchParams.get('period') || undefined
  const startParam = url.searchParams.get('start') || undefined
  const endParam = url.searchParams.get('end') || undefined
  const { start, end } = deriveRange(period, startParam ?? null, endParam ?? null)
  const startOpt = start || undefined
  const endOpt = end || undefined
  if (startOpt) url.searchParams.set('start', startOpt); else url.searchParams.delete('start')
  if (endOpt) url.searchParams.set('end', endOpt); else url.searchParams.delete('end')

  // Delegate to JSON route (inherits RBAC/filters)
  const jsonResp = await JSON_LIST(new Request(url.toString(), { headers: (hasReq ? (req as any).headers : undefined) }) as any)
  if (!('ok' in jsonResp) || !(jsonResp as any).ok) return jsonResp as any
  const data = await (jsonResp as any).json() as { receipts: Array<any> }
  const list = Array.isArray(data.receipts) ? data.receipts : []

  const baseCurrency = (db.settings?.baseCurrency as string) || 'USD'
  const lines: string[] = []
  if (versionFlag) lines.push('CSV-Version,1')
  const asOfIso = endOpt || todayIso()
  lines.push(csvEscape(buildCsvCaption(startOpt || null, endOpt || null, asOfIso)))
  lines.push('')
  lines.push(['Date','Vendor','Amount','Status','Method','Attachment','Matched Transaction'].map(csvEscape).join(','))
  for (const r of list) {
    lines.push([
      String((r.date || '').slice(0,10)),
      String(r.vendor || ''),
      formatCurrency(Number(r.amount || 0), baseCurrency),
      String(r.status || ''),
      String(r.method || ''),
      String(r.attachment?.name || ''),
      String(r.matchedTransactionId || ''),
    ].map(csvEscape).join(','))
  }

  const tokens: string[] = []
  const vendor = url.searchParams.get('vendor') || ''
  const status = url.searchParams.get('status') || ''
  const matched = url.searchParams.get('matched') || ''
  if (vendor) tokens.push(`vendor-${sanitizeToken(vendor)}`)
  if (status) tokens.push(`status-${sanitizeToken(status)}`)
  if (matched) tokens.push(`matched-${sanitizeToken(matched)}`)
  const filename = buildCsvFilename('receipts', { start: startOpt, end: endOpt, asOfIso: asOfIso, period, tokens })
  return new NextResponse(lines.join('\n'), { status: 200, headers: { 'Content-Type': 'text/csv; charset=utf-8', 'Content-Disposition': `attachment; filename="${filename}"`, 'Cache-Control': 'no-store' } })
}
