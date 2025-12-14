import { NextResponse } from 'next/server'
import { getRoleFromCookies, hasPermission } from '@/lib/rbac-server'
import { deriveRange as deriveRangeShared } from '@/lib/report-helpers'
import { db, seedIfNeeded } from '@/mock/db'

type Row = { customer: string; invoiceNumber: string; invoiceDate: string; dueDate: string; paymentDate: string | null; paymentAmount: number | null; openBalance: number }

// Use shared deriveRange for consistency
const deriveRange = deriveRangeShared

function generateRows(asOfIso: string, start?: string | null, end?: string | null): Row[] {
  seedIfNeeded()
  const rows: Row[] = []
  for (const inv of db.invoices) {
    if (inv.status === 'void' || inv.status === 'draft') continue
    const invDate = (inv.date || '').slice(0,10)
    if (start && invDate < start) continue
    if (end && invDate > end) continue
    const cust = db.customers.find(c => c.id === inv.customerId)
    const dueIso = (inv.dueDate || inv.date || '').slice(0,10)
    // Determine latest payment on/before as-of, and open balance as-of
    const paymentsOnOrBefore = (inv.payments || [])
      .filter(p => (p.appliedToType === 'invoice') && (p.appliedToId === inv.id) && (!!p.date) && p.date.slice(0,10) <= asOfIso)
      .sort((a,b) => (a.date || '').localeCompare(b.date || ''))
    const lastPayment = paymentsOnOrBefore.length > 0 ? paymentsOnOrBefore[paymentsOnOrBefore.length - 1] : undefined
    const paidToDate = paymentsOnOrBefore.reduce((s,p)=> s + (Number(p.amount)||0), 0)
    const openBalance = Math.max(0, Number(((Number(inv.total)||0) - paidToDate).toFixed(2)))
    rows.push({
      customer: cust?.name || 'Unknown customer',
      invoiceNumber: inv.number,
      invoiceDate: invDate,
      dueDate: dueIso,
      paymentDate: lastPayment ? (lastPayment.date || '').slice(0,10) : null,
      paymentAmount: lastPayment ? Number(lastPayment.amount) : null,
      openBalance,
    })
  }
  // Sort by customer then invoice date
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
