import { NextResponse } from 'next/server'
import { getRoleFromCookies, hasPermission } from '@/lib/rbac-server'
import { deriveRange } from '@/lib/report-helpers'
import { db, seedIfNeeded } from '@/mock/db'

type Row = { customer: string; invoiceNumber: string; dueDate: string; daysOverdue: number; openBalance: number; contact: string; phone: string }

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
  // Ensure mock data is available
  try { seedIfNeeded() } catch {}
  const asOfIso = end || new Date().toISOString().slice(0, 10)
  const asOfDate = new Date(asOfIso + 'T00:00:00Z')
  // Build rows from open overdue invoices
  const rows: Row[] = (db.invoices || [])
    .filter(inv => inv.status !== 'void' && (inv.balance ?? (inv.total - inv.payments.reduce((s: number, p: any) => s + (p.amount || 0), 0))) > 0)
    .map(inv => {
      const dueIso = (inv.dueDate ? new Date(inv.dueDate) : new Date(new Date(inv.date).getTime() + 30*86400000)).toISOString().slice(0,10)
      const daysOverdue = Math.max(0, Math.floor((asOfDate.getTime() - new Date(dueIso + 'T00:00:00Z').getTime()) / 86400000))
      const cust = db.customers.find(c => c.id === inv.customerId)
      const openBalance = Number((inv.balance ?? (inv.total - inv.payments.reduce((s: number, p: any) => s + (p.amount || 0), 0))).toFixed(2))
      return {
        customer: cust?.name || 'Customer',
        invoiceNumber: inv.number,
        dueDate: dueIso,
        daysOverdue,
        openBalance,
        contact: '',
        phone: '',
      } as Row
    })
    .filter(r => r.daysOverdue > 0)
    .sort((a, b) => b.daysOverdue - a.daysOverdue || b.openBalance - a.openBalance)
  const totals: { openBalance: number } = rows.reduce((acc: { openBalance: number }, r: Row) => { acc.openBalance += r.openBalance; return acc }, { openBalance: 0 })
  return NextResponse.json({ rows, totals, asOf: asOfIso, start: start || null, end: end || null, period: (period || null) })
}
