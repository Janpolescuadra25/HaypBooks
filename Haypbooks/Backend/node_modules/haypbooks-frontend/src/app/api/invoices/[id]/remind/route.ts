import { NextResponse } from 'next/server'
import { getRoleFromCookies, hasPermission } from '@/lib/rbac-server'
import { db, findInvoice as dbFindInvoice } from '@/mock/db'
import { logEvent } from '@/lib/audit'

/**
 * POST /api/invoices/:id/remind
 * Sends (simulated) a payment reminder for a single invoice.
 * Collections features: maintains lastReminderDate & reminderCount with 5‑day throttle.
 * Response shape matches UI expectation: { ok: boolean; invoice: {...}; message? }
 * If throttled, returns ok:false with a message (HTTP 200) so caller can surface a non-fatal toast.
 */
export async function POST(_req: Request, { params }: { params: { id: string } }) {
  const { id } = params
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 })
  const role = getRoleFromCookies()
  if (!hasPermission(role, 'invoices:write')) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  try {
    const inv = dbFindInvoice(id)
    if (!inv) return NextResponse.json({ error: 'Not Found' }, { status: 404 })

    const today = new Date().toISOString().slice(0, 10)
    const THROTTLE_DAYS = 5
    if (inv.lastReminderDate) {
      const diffDays = Math.floor((new Date(today).getTime() - new Date(inv.lastReminderDate).getTime()) / 86400000)
      if (diffDays < THROTTLE_DAYS) {
        // Throttled – do not update counters
        const invoice = { ...inv, customer: db.customers.find(c => c.id === inv.customerId)?.name || inv.customerId }
        return NextResponse.json({ ok: false, invoice, message: `Throttled (${diffDays}d since last)` })
      }
    }

  // Simulate very small transient failure chance (mirrors batch realism). If it occurs, surface as ok:false.
  // Disabled under test env to keep the suite deterministic.
  const transientFail = process.env.NODE_ENV !== 'test' && Math.random() < 0.03
    if (transientFail) {
      const invoice = { ...inv, customer: db.customers.find(c => c.id === inv.customerId)?.name || inv.customerId }
      return NextResponse.json({ ok: false, invoice, message: 'Temporary failure, retry' })
    }

    // Update tracking fields
  inv.lastReminderDate = today
  inv.reminderCount = (inv.reminderCount || 0) + 1
  // Update dunning stage escalation (simple rule set by cumulative reminders)
  const rc = inv.reminderCount || 0
  if (rc >= 4) inv.dunningStage = 'Stage4'
  else if (rc >= 3) inv.dunningStage = 'Stage3'
  else if (rc >= 2) inv.dunningStage = 'Stage2'
  else inv.dunningStage = 'Stage1'
    logEvent({ userId: 'u_mock', action: 'invoice:remind', entity: 'invoice', entityId: inv.id, meta: { number: inv.number, via: 'single', reminderCount: inv.reminderCount } })
    const invoice = { ...inv, customer: db.customers.find(c => c.id === inv.customerId)?.name || inv.customerId }
    return NextResponse.json({ ok: true, invoice })
  } catch (e: any) {
    return NextResponse.json({ error: 'Not Found' }, { status: 404 })
  }
}
