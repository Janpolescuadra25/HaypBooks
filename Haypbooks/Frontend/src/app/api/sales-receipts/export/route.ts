import { NextResponse } from 'next/server'
import { todayIso } from '@/lib/date'
import { buildCsvFilename, sanitizeToken, parseCsvVersionFlag } from '@/lib/csv'
import { getRoleFromCookies, hasPermission } from '@/lib/rbac-server'
import { db, seedIfNeeded } from '@/mock/db'
import { buildCsvCaption, deriveRange } from '@/lib/report-helpers'
import { formatCurrency } from '@/lib/format'

function toCsvCell(v: any) {
  if (v == null) return ''
  const s = String(v)
  if (/[,"\n]/.test(s)) return '"' + s.replace(/"/g, '""') + '"'
  return s
}

// No dedicated sales receipts store in DB; derive a simple view from invoices as immediate payments (paid on same day).

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
  if (!db.seeded) { try { seedIfNeeded() } catch {} }
  const baseCurrency = (db.settings?.baseCurrency as string) || 'USD'
  let rows = (db.invoices || [])
    .filter((inv: any) => inv.status === 'paid')
    .map((inv: any) => ({
      date: inv.date.slice(0, 10),
      customer: db.customers.find(c => c.id === inv.customerId)?.name || inv.customerId,
      description: inv.lines?.[0]?.description || 'Sales receipt',
      amount: inv.total,
    }))
  if (startOpt) rows = rows.filter(r => r.date >= startOpt)
  if (endOpt) rows = rows.filter(r => r.date <= endOpt)
  const asOfIso = endOpt || todayIso()
  const tokens: string[] = []
  if (period) tokens.push(`period-${sanitizeToken(period)}`)
  const filename = buildCsvFilename('sales-receipts', { start: startOpt, end: endOpt, asOfIso, tokens })
  const out: string[] = []
  // When opted-in, emit CSV-Version as the first row
  if (versionFlag) out.push('CSV-Version,1')
  out.push(buildCsvCaption(startOpt || null, endOpt || null, asOfIso))
  out.push('')
  out.push(['Date', 'Customer', 'Description', 'Amount'].join(','))
  for (const r of rows) {
    out.push([
      r.date,
      r.customer,
      r.description || '',
      formatCurrency(Number(r.amount || 0), baseCurrency),
    ].map(toCsvCell).join(','))
  }
  const body = out.join('\n')
  return new NextResponse(body, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Cache-Control': 'no-store',
    },
  })
}
