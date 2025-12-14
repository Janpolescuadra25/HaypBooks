import { NextResponse } from 'next/server'
import { getRoleFromCookies, hasPermission } from '@/lib/rbac-server'
import { db } from '@/mock/db'
import { logEvent } from '@/lib/audit'

/**
 * POST /api/collections/reminders
 * Body: { customerIds: string[] }
 * For each customer, send reminders for all OPEN invoices (balance > 0, status != 'paid' && != 'void').
 * Returns per-customer summary with invoice results similar to invoice batch reminder shape.
 */
export async function POST(req: Request) {
  const role = getRoleFromCookies()
  if (!hasPermission(role, 'invoices:write')) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  const body = await req.json().catch(()=>({})) as any
  const ids: string[] = Array.isArray(body?.customerIds) ? body.customerIds.map((v: any)=> String(v)) : []
  if (!ids.length) return NextResponse.json({ error: 'customerIds array required' }, { status: 400 })
  const unique = Array.from(new Set(ids))
  const today = new Date().toISOString().slice(0,10)
  const THROTTLE_DAYS = 5
  const results = unique.map(customerId => {
    const invoices = db.invoices.filter(inv => inv.customerId === customerId && inv.status !== 'void' && inv.status !== 'paid' && (inv.balance ?? (inv.total - inv.payments.reduce((s,p)=>s+p.amount,0))) > 0)
    const invoiceResults = invoices.map(inv => {
      // Throttle: skip if lastReminderDate within last THROTTLE_DAYS
      if (inv.lastReminderDate) {
        const diffDays = Math.floor((new Date(today).getTime() - new Date(inv.lastReminderDate).getTime())/86400000)
        if (diffDays < THROTTLE_DAYS) {
          return { id: inv.id, ok: false, message: `Throttled (${diffDays}d since last)` }
        }
      }
      const isTest = process.env.NODE_ENV === 'test'
      const transientFail = !isTest && Math.random() < 0.05
      if (transientFail) return { id: inv.id, ok: false, message: 'Temporary failure, retry' }
      inv.lastReminderDate = today
      inv.reminderCount = (inv.reminderCount || 0) + 1
  // Maintain dunning stage on batch send
  const rc = inv.reminderCount || 0
  if (rc >= 4) inv.dunningStage = 'Stage4'
  else if (rc >= 3) inv.dunningStage = 'Stage3'
  else if (rc >= 2) inv.dunningStage = 'Stage2'
  else inv.dunningStage = 'Stage1'
      logEvent({ userId: 'u_mock', action: 'invoice:remind', entity: 'invoice', entityId: inv.id, meta: { number: inv.number, batch: true, via: 'collections', reminderCount: inv.reminderCount } })
      return { id: inv.id, ok: true }
    })
    const ok = invoiceResults.filter(r=>r.ok).length
    return { customerId, invoices: invoiceResults.length, sent: ok, results: invoiceResults }
  })
  return NextResponse.json({ results })
}
