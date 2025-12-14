import { NextResponse } from 'next/server'
import { getRoleFromCookies, hasPermission } from '@/lib/rbac-server'
import { db } from '@/mock/db'

function isoDateOnly(d: Date) { return d.toISOString().slice(0,10) }

export async function GET(req: Request) {
  const role = getRoleFromCookies()
  const canWrite = hasPermission(role, 'journal:write') || hasPermission(role, 'invoices:write' as any)
  if (!canWrite) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const url = new URL(req.url)
  const asOfIso = url.searchParams.get('asOf') || isoDateOnly(new Date())
  const maxAmount = Math.max(0, Number(url.searchParams.get('maxAmount') || 50))
  const minDaysPastDue = Math.max(0, Number(url.searchParams.get('minDaysPastDue') || 60))
  const customerId = url.searchParams.get('customerId') || undefined

  const asOf = new Date(asOfIso + 'T00:00:00Z')
  const today = new Date(isoDateOnly(new Date()) + 'T00:00:00Z')
  const baseCurrency = (db.settings?.baseCurrency as string) || 'USD'

  // Collect candidate open invoices
  const candidates = db.invoices
    .filter(inv => inv.balance > 0 && (!customerId || inv.customerId === customerId))
    .map(inv => {
      const dueIso = inv.dueDate || inv.date
      const due = new Date(dueIso)
      let daysPastDue = 0
      if (!isNaN(due.valueOf())) {
        const anchor = new Date(asOf.getTime())
        daysPastDue = Math.max(0, Math.floor((anchor.getTime() - due.getTime()) / 86400000))
      }
      return {
        id: inv.id,
        number: inv.number,
        customerId: inv.customerId,
        customer: db.customers.find(c => c.id === inv.customerId)?.name || inv.customerId,
        balance: inv.balance,
        dueDate: (inv.dueDate || inv.date).slice(0,10),
        daysPastDue,
      }
    })

  const rows = candidates
    .filter(r => r.daysPastDue >= minDaysPastDue)
    .filter(r => r.balance <= maxAmount)
    .sort((a,b)=> b.daysPastDue - a.daysPastDue || a.customer.localeCompare(b.customer))
    .map(r => ({
      ...r,
      suggestedAmount: Math.min(r.balance, maxAmount),
    }))

  return NextResponse.json({
    asOf: asOfIso,
    baseCurrency,
    filters: { maxAmount, minDaysPastDue, customerId: customerId || null },
    rows,
    total: rows.length,
  })
}
