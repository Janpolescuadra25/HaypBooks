import { NextResponse } from 'next/server'
import { getRoleFromCookies, hasPermission } from '@/lib/rbac-server'
import { db, seedIfNeeded } from '@/mock/db'

export async function GET() {
  try { seedIfNeeded() } catch {}
  const role = getRoleFromCookies()
  if (!hasPermission(role, 'invoices:read') && !hasPermission(role, 'reports:read')) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }
  const rows: any[] = []
  for (const inv of db.invoices) {
    for (const p of inv.payments) {
      if (p.fundSource === 'undeposited' && !p.depositId) {
        rows.push({
          id: p.id,
          invoiceId: inv.id,
          invoiceNumber: inv.number,
          customerId: inv.customerId,
          customer: db.customers.find(c=>c.id===inv.customerId)?.name || inv.customerId,
          amount: p.amount,
          date: p.date,
        })
      }
    }
  }
  rows.sort((a,b)=> b.date.localeCompare(a.date))
  return NextResponse.json({ payments: rows, total: rows.length })
}
