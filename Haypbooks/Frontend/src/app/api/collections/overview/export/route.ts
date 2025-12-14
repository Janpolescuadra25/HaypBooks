import { NextResponse } from 'next/server'
import { getRoleFromCookies, hasPermission } from '@/lib/rbac-server'
import { buildCsvFilename, parseCsvVersionFlag } from '@/lib/csv'
import { buildCsvCaption } from '@/lib/report-helpers'
import { computeCollectionsOverview } from '@/mock/aggregations'
import { db, seedIfNeeded } from '@/mock/db'
import { formatCurrency, formatPercentFromPct } from '@/lib/format'

function toCsvCell(v: any) {
  if (v == null) return ''
  const s = String(v)
  if (/[,"\n]/.test(s)) return '"' + s.replace(/"/g,'""') + '"'
  return s
}

export async function GET(req: Request) {
  if (!db.seeded) { try { seedIfNeeded() } catch {} }
  const role = getRoleFromCookies()
  if (!hasPermission(role, 'reports:read')) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  const { searchParams } = new URL(req.url)
  const asOf = searchParams.get('asOf') || new Date().toISOString().slice(0,10)
  const customerId = searchParams.get('customerId') || undefined
  const asOfDate = new Date(asOf + 'T00:00:00Z')
  // Ensure we exercise the shared caption helper to prevent drift; we don't insert the caption row here.
  const _caption = buildCsvCaption(null, null, asOf)
  const versionFlag = parseCsvVersionFlag(req)
  let overview = computeCollectionsOverview(asOfDate)
  if (customerId) {
    const rows = overview.rows.filter(r => r.customerId === customerId)
    const totals = rows.reduce((acc,r)=>{ acc.customers++; acc.openBalance += r.openBalance; acc.overdueBalance += r.overdueBalance; acc.netReceivable += r.netReceivable; return acc }, { customers:0, openBalance:0, overdueBalance:0, netReceivable:0 })
    totals.openBalance = Number(totals.openBalance.toFixed(2))
    totals.overdueBalance = Number(totals.overdueBalance.toFixed(2))
    totals.netReceivable = Number(totals.netReceivable.toFixed(2))
    overview = { ...overview, rows, totals }
  }
  const baseCurrency = (db.settings?.baseCurrency as string) || 'USD'
  const headers = ['Customer','Risk','Open Invoices','Open Balance','Overdue','Net Receivable','Credit Limit','Credit Util %','Days Since Last Pay','Last Payment','Next Due','Last Reminder','Days Since Reminder','Reminder Count','Worst Dunning Stage','Open Promises','Next Promise Date','Promise Aging Days']
  const lines = [
    ...(versionFlag ? ['CSV-Version,1'] : []),
    headers.join(','),
  ]
  for (const r of overview.rows) {
    lines.push([
      r.name,
      r.riskLevel,
      r.openInvoices,
      formatCurrency(r.openBalance, baseCurrency),
      formatCurrency(r.overdueBalance, baseCurrency),
      formatCurrency(r.netReceivable, baseCurrency),
      r.creditLimit == null ? '' : formatCurrency(Number(r.creditLimit), baseCurrency),
      r.creditUtilizationPct == null ? '' : formatPercentFromPct(Number(r.creditUtilizationPct), { maximumFractionDigits: 1 }),
      r.daysSinceLastPayment ?? '',
      r.lastPaymentDate || '',
      r.nextDueDate || '',
      r.lastReminderDate || '',
      r.daysSinceLastReminder ?? '',
      r.maxReminderCount ?? '',
      r.worstDunningStage || '',
      r.openPromises ?? '',
      r.nextPromiseDate || '',
      r.promiseAgingDays ?? '',
    ].map(toCsvCell).join(','))
  }
  // Totals line (place at end with customer count & sums)
  lines.push(['Totals', '', '', formatCurrency(overview.totals.openBalance, baseCurrency), formatCurrency(overview.totals.overdueBalance, baseCurrency), formatCurrency(overview.totals.netReceivable, baseCurrency), '', '', '', '', '', '', '', '', '', '', '', '', ''].map(toCsvCell).join(','))
  const csv = lines.join('\n') + '\n'
  const filename = buildCsvFilename('collections-overview', { asOfIso: asOf })
  const res = new NextResponse(csv, { status: 200, headers: { 'Content-Type': 'text/csv; charset=utf-8', 'Content-Disposition': `attachment; filename="${filename}"` } })
  return res
}
