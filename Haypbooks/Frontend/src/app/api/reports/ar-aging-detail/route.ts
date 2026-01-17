import { NextResponse } from 'next/server'
import { getRoleFromCookies, hasPermission } from '@/lib/rbac-server'
import { deriveRange as deriveRangeShared } from '@/lib/report-helpers'
import { db, seedIfNeeded } from '@/mock/db'

type Row = { customer: string; type: string; number: string; invoiceDate: string; dueDate: string; aging: number; openBalance: number }

const deriveRange = deriveRangeShared

function computeOpenBalanceAsOf(inv: any, asOfIso: string) {
  const paidToDate = (inv.payments || [])
    .filter((p: any) => p.appliedToType === 'invoice' && p.appliedToId === inv.id && p.date && p.date.slice(0,10) <= asOfIso)
    .reduce((s: number, p: any) => s + (Number(p.amount) || 0), 0)
  const open = Math.max(0, Number(((Number(inv.total) || 0) - paidToDate).toFixed(2)))
  return open
}

function daysPastDue(inv: any, asOfIso: string) {
  const dueIso = (inv.dueDate || inv.date || '').slice(0,10)
  if (!dueIso) return 0
  const dd = new Date(dueIso + 'T00:00:00Z')
  const ad = new Date(asOfIso + 'T00:00:00Z')
  const diff = Math.floor((ad.getTime() - dd.getTime()) / 86400000)
  return Math.max(0, diff)
}

function inBucketLabel(dpd: number): 'current' | '30' | '60' | '90' | '120+' {
  if (dpd === 0) return 'current'
  if (dpd <= 30) return '30'
  if (dpd <= 60) return '60'
  if (dpd <= 90) return '90'
  return '120+'
}

export async function GET(req: Request) {
  const role = getRoleFromCookies()
  if (!hasPermission(role, 'reports:read')) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const url = new URL(req.url)
  const period = url.searchParams.get('period') || undefined
  const customer = url.searchParams.get('customer') || undefined
  const customerId = url.searchParams.get('customerId') || undefined
  const bucket = (url.searchParams.get('bucket') || undefined) as undefined | 'current' | '30' | '60' | '90' | '120+'
  let start = url.searchParams.get('start')
  let end = url.searchParams.get('end')
  const derived = deriveRange(period, start, end)
  start = derived.start || start
  end = derived.end || end
  const asOfIso = end || new Date().toISOString().slice(0,10)

  seedIfNeeded()
  const rows: Row[] = []
  for (const inv of db.invoices) {
    if (customerId && inv.customerId !== customerId) continue
    if (inv.status === 'void' || inv.status === 'draft') continue
    const invDate = (inv.date || '').slice(0,10)
    if (start && invDate < start) continue
    if (end && invDate > end) continue
    const dueIso = (inv.dueDate || inv.date || '').slice(0,10)
    // Only include invoices whose due date is on or before the requested as-of
    if (dueIso && dueIso > asOfIso) continue
    const open = computeOpenBalanceAsOf(inv, asOfIso)
    if (open <= 0) continue
    const dpd = daysPastDue(inv, asOfIso)
    const custName = db.customers.find(c => c.id === inv.customerId)?.name || 'Unknown customer'
    rows.push({
      customer: custName,
      type: 'Invoice',
      number: inv.number,
      invoiceDate: invDate,
      dueDate: (inv.dueDate || inv.date || '').slice(0,10),
      aging: dpd,
      openBalance: open,
    })
  }

  let filtered = rows
  if (customer) filtered = filtered.filter(r => r.customer === customer)
  if (bucket) filtered = filtered.filter(r => inBucketLabel(r.aging) === bucket)
  // Sort by customer then due date asc for stable output
  filtered.sort((a,b) => a.customer.localeCompare(b.customer) || a.dueDate.localeCompare(b.dueDate))

  const totals = filtered.reduce((acc, r) => { acc.openBalance += r.openBalance; return acc }, { openBalance: 0 })
  return NextResponse.json({ rows: filtered, totals, asOf: asOfIso, start: start || null, end: end || null, period: (period || null) })
}
