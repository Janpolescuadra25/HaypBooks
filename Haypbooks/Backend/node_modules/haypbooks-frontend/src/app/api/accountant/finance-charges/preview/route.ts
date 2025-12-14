import { NextResponse } from 'next/server'
import { getRoleFromCookies, hasPermission } from '@/lib/rbac-server'
import { db, seedIfNeeded } from '@/mock/db'

function iso(d: Date) { return d.toISOString().slice(0,10) }

export async function GET(req: Request) {
  try { seedIfNeeded() } catch {}
  const role = getRoleFromCookies()
  // Write permission required to preview assessed charges
  const canWrite = hasPermission(role, 'journal:write' as any) || hasPermission(role, 'invoices:write' as any)
  if (!canWrite) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const url = new URL(req.url)
  const asOfIso = url.searchParams.get('asOf') || iso(new Date())
  const annualRatePct = Math.max(0, Number(url.searchParams.get('annualRatePct') || 18))
  const minCharge = Math.max(0, Number(url.searchParams.get('minCharge') || 2))
  const graceDays = Math.max(0, Number(url.searchParams.get('graceDays') || 0))
  const customerId = url.searchParams.get('customerId') || undefined

  // Simple daily rate from annual nominal percentage (12*30 day year approx.)
  const dailyRate = (annualRatePct / 100) / 365

  const asOf = new Date(asOfIso + 'T00:00:00Z')
  const rows = db.invoices
    .filter(inv => inv.balance > 0 && (customerId ? inv.customerId === customerId : true))
    .map(inv => {
      const dueIso = (inv.dueDate || inv.date).slice(0,10)
      const due = new Date(dueIso)
      const days = Math.max(0, Math.floor((asOf.getTime() - due.getTime())/86400000) - graceDays)
      const base = inv.balance
      const accrued = days > 0 ? Math.max(minCharge, Math.round(base * dailyRate * days * 100) / 100) : 0
      return {
        id: inv.id,
        number: inv.number,
        customerId: inv.customerId,
        customer: db.customers.find(c => c.id === inv.customerId)?.name || inv.customerId,
        dueDate: dueIso,
        daysPastDue: Math.max(0, Math.floor((asOf.getTime() - due.getTime())/86400000)),
        assessDays: days,
        balance: base,
        suggestedCharge: accrued,
      }
    })
    .filter(r => r.assessDays > 0 && r.suggestedCharge > 0)
    .sort((a,b)=> b.daysPastDue - a.daysPastDue || a.customer.localeCompare(b.customer))

  return NextResponse.json({ asOf: asOfIso, filters: { annualRatePct, minCharge, graceDays, customerId: customerId||null }, rows, total: rows.length })
}
