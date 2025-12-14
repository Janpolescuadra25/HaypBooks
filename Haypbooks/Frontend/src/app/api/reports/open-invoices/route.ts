import { NextResponse } from 'next/server'
import { getRoleFromCookies, hasPermission } from '@/lib/rbac-server'
import { deriveRange as deriveRangeShared } from '@/lib/report-helpers'
import { db, seedIfNeeded } from '@/mock/db'

type Row = { customer: string; type: string; number: string; invoiceDate: string; dueDate: string; aging: number; openBalance: number }

// Use shared deriveRange to ensure consistency across reports
const deriveRange = deriveRangeShared

function generateRows(asOfIso: string, start?: string | null, end?: string | null): Row[] {
  seedIfNeeded()
  const asOf = asOfIso
  const rows: Row[] = []
  for (const inv of db.invoices) {
    // Exclude void invoices and drafts from Open Invoices; focus on unpaid balances as of asOf date
    if (inv.status === 'void' || inv.status === 'draft') continue
    const invDate = (inv.date || '').slice(0,10)
    if (start && invDate < start) continue
    if (end && invDate > end) continue
    // Compute payments applied up to as-of
    const paidToDate = (inv.payments || [])
      .filter(p => (p.appliedToType === 'invoice') && (p.appliedToId === inv.id) && (!!p.date) && p.date.slice(0,10) <= asOf)
      .reduce((s,p) => s + (Number(p.amount) || 0), 0)
    const openBal = Math.max(0, Number(((Number(inv.total) || 0) - paidToDate).toFixed(2)))
    if (openBal <= 0) continue
    const cust = db.customers.find(c => c.id === inv.customerId)
    const dueIso = (inv.dueDate || inv.date || '').slice(0,10)
    // Aging days: days past due relative to as-of; never negative
    let agingDays = 0
    if (dueIso) {
      const dd = new Date(dueIso + 'T00:00:00Z')
      const ad = new Date(asOf + 'T00:00:00Z')
      const diff = Math.floor((ad.getTime() - dd.getTime()) / 86400000)
      agingDays = Math.max(0, diff)
    }
    rows.push({
      customer: cust?.name || 'Unknown customer',
      type: 'Invoice',
      number: inv.number,
      invoiceDate: invDate,
      dueDate: dueIso,
      aging: agingDays,
      openBalance: openBal,
    })
  }
  // Stable sort by customer then invoice date
  rows.sort((a,b) => a.customer.localeCompare(b.customer) || a.invoiceDate.localeCompare(b.invoiceDate))
  return rows
}

export async function GET(req: Request) {
  const role = getRoleFromCookies()
  if (!hasPermission(role, 'reports:read')) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  const url = new URL(req.url)
  const period = url.searchParams.get('period') || undefined
  let start = url.searchParams.get('start')
  let end = url.searchParams.get('end')
  const derived = deriveRange(period, start, end)
  start = derived.start || start
  end = derived.end || end

  const asOfIso = end || new Date().toISOString().slice(0, 10)
  const rows = generateRows(asOfIso, start, end)
  const totals = rows.reduce((acc, r) => { acc.openBalance += r.openBalance; return acc }, { openBalance: 0 })
  return NextResponse.json({ rows, totals, asOf: asOfIso, start: start || null, end: end || null, period: (period || null) })
}
