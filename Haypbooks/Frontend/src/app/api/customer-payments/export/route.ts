import { NextResponse } from 'next/server'
import { db } from '@/mock/db'
import { getRoleFromCookies, hasPermission } from '@/lib/rbac-server'
import { buildCsvCaption, deriveRange } from '@/lib/report-helpers'
import { buildCsvFilename, sanitizeToken, parseCsvVersionFlag } from '@/lib/csv'
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

  // CSV-Version opt-in using shared parser
  const versionFlag = parseCsvVersionFlag(req)
  const url = new URL(req.url)
  const period = url.searchParams.get('period') || undefined
  const startParam = url.searchParams.get('start') || undefined
  const endParam = url.searchParams.get('end') || undefined
  const qRaw = (url.searchParams.get('q') || '')
  const q = qRaw.toLowerCase()
  const customerId = url.searchParams.get('customerId') || undefined
  const { start, end } = deriveRange(period, startParam ?? null, endParam ?? null)
  const startOpt = start || undefined
  const endOpt = end || undefined

  // Delegate to JSON route for source of truth
  const jsonResp = await getJson(req as any)
  if (!jsonResp.ok) return jsonResp as any
  const payload = await jsonResp.json() as { customerPayments: Array<{ id: string; customer: string; date: string; amountReceived: number; amountAllocated: number; amountUnapplied: number; status: string; allocations: Array<{ invoiceNumber: string; amount: number }> }>; totals?: any }
  const items = payload.customerPayments || []

  const baseCurrency = (db.settings?.baseCurrency as string) || 'USD'
  const rows = items.map(p => {
    const allocations = (p.allocations || []).map(a => `${a.invoiceNumber}:${formatCurrency(Number(a.amount || 0), baseCurrency)}`).join(' | ')
    return {
      date: String(p.date || '').slice(0,10),
      id: p.id,
      customer: p.customer,
      amountReceived: Number(p.amountReceived || 0),
      amountAllocated: Number(p.amountAllocated || 0),
      amountUnapplied: Number(p.amountUnapplied || 0),
      allocations,
      status: String(p.status || ''),
    }
  })
  .filter(r => !startOpt || r.date >= startOpt!)
  .filter(r => !endOpt || r.date <= endOpt!)
  .filter(r => !q || r.id.toLowerCase().includes(q) || r.customer.toLowerCase().includes(q) || r.allocations.toLowerCase().includes(q))

  const lines: string[] = []
  if (versionFlag) lines.push('CSV-Version,1')
  lines.push(csvEscape(buildCsvCaption(startOpt || null, endOpt || null, endOpt || todayIso())))
  lines.push(['Date', 'Payment ID', 'Customer', 'Received', 'Allocated', 'Unapplied', 'Allocations', 'Status'].map(csvEscape).join(','))
  for (const r of rows) {
    lines.push([
      r.date,
      r.id,
      r.customer,
      formatCurrency(Number(r.amountReceived) || 0, baseCurrency),
      formatCurrency(Number(r.amountAllocated) || 0, baseCurrency),
      formatCurrency(Number(r.amountUnapplied) || 0, baseCurrency),
      r.allocations,
      r.status,
    ].map(csvEscape).join(','))
  }

  const tokens: string[] = []
  if (period) tokens.push(`period-${sanitizeToken(period)}`)
  if (qRaw) tokens.push(`q-${sanitizeToken(qRaw)}`)
  if (customerId) tokens.push(`cust-${sanitizeToken(customerId)}`)
  const filename = buildCsvFilename('customer-payments', { start: startOpt, end: endOpt, asOfIso: endOpt || todayIso(), tokens })

  return new NextResponse(lines.join('\n'), {
    status: 200,
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Cache-Control': 'no-store',
    },
  })
}
