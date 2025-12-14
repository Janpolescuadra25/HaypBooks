import { NextResponse } from 'next/server'
import { getRoleFromCookies, hasPermission } from '@/lib/rbac-server'
import { db, seedIfNeeded } from '@/mock/db'

// Business rules:
// - Throttle: minimum 5 days between reminders per invoice (lastReminderDate)
// - Overdue only: invoice dueDate < asOf and balance > 0 and status not draft/void
// - Dunning stage escalation by cumulative reminderCount thresholds (simple heuristic)
// - Audit events: per-invoice invoice:reminder and wrapper reminder:send:batch

const MIN_INTERVAL_DAYS = 5
function daysBetween(a: string, b: string) { return Math.floor((new Date(b).getTime() - new Date(a).getTime())/86400000) }
function isIsoDate(s: string) { return /^\d{4}-\d{2}-\d{2}$/.test(s) }
function escalateStage(prev: string | undefined, count: number): 'Stage1'|'Stage2'|'Stage3'|'Stage4' {
  if (count >= 9) return 'Stage4'
  if (count >= 6) return 'Stage3'
  if (count >= 3) return 'Stage2'
  return prev === 'Stage2' || prev === 'Stage3' || prev === 'Stage4' ? prev as any : 'Stage1'
}

export async function POST(req: Request) {
  const role = getRoleFromCookies()
  if (!hasPermission(role, 'collections:send')) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  seedIfNeeded()
  const url = new URL(req.url)
  const asOf = url.searchParams.get('asOf') || new Date().toISOString().slice(0,10)
  const customerId = url.searchParams.get('customerId') || null
  if (!isIsoDate(asOf)) return NextResponse.json({ error: 'Invalid parameters', asOf }, { status: 400 })
  // Idempotency: same scope (asOf + customerId filter) within 10 minutes returns original batch
  const tenMinutesAgo = Date.now() - 10*60*1000
  let existing: any | undefined
  for (const ev of (db.auditEvents || []).filter((e: any) => e?.action === 'reminder:send:batch')) {
    const tsMs = ev.ts ? Date.parse(ev.ts) : 0
    if (!tsMs || tsMs < tenMinutesAgo) continue
    const after = ev.after || {}
    if (after.asOf === asOf && (after.customerFilter || null) === (customerId || null)) {
      existing = ev
      break
    }
  }
  if (existing) {
    return NextResponse.json({ result: { batchId: existing.entityId, asOf, count: existing.after?.count || 0, items: [], idempotent: true } })
  }
  // Candidate invoices
  const updates: any[] = []
  for (const inv of db.invoices) {
    if (customerId && inv.customerId !== customerId) continue
    if (inv.status === 'draft' || inv.status === 'void') continue
    if (!inv.dueDate) continue
    if (inv.balance <= 0) continue
    if (inv.dueDate.slice(0,10) >= asOf) continue // not yet overdue
    // Throttle check
    if (inv.lastReminderDate && daysBetween(inv.lastReminderDate, asOf) < MIN_INTERVAL_DAYS) continue
    // Update invoice reminder metadata
    inv.lastReminderDate = asOf
    inv.reminderCount = (inv.reminderCount || 0) + 1
    inv.dunningStage = escalateStage(inv.dunningStage, inv.reminderCount)
    updates.push({ invoiceId: inv.id, customerId: inv.customerId, reminderCount: inv.reminderCount, dunningStage: inv.dunningStage, lastReminderDate: inv.lastReminderDate })
  }
  const batchId = `rem_batch_${Date.now().toString(36)}_${Math.random().toString(36).slice(2,6)}`
  const ts = new Date().toISOString()
  try {
    for (const u of updates) {
      ;(db.auditEvents ||= []).push({
        id: `aud_${Date.now().toString(36)}_${Math.random().toString(36).slice(2,6)}`,
        ts,
        actor: 'system',
        action: 'invoice:reminder',
        entityType: 'invoice',
        entityId: u.invoiceId,
        after: { ...u, batchId, asOf },
        meta: { scope: 'ar', batchId }
      } as any)
    }
    ;(db.auditEvents ||= []).push({
      id: `aud_${Date.now().toString(36)}_${Math.random().toString(36).slice(2,6)}`,
      ts,
      actor: 'system',
      action: 'reminder:send:batch',
      entityType: 'collections-batch',
      entityId: batchId,
      after: { batchId, asOf, count: updates.length, customerFilter: customerId || null },
      meta: { scope: 'ar' }
    } as any)
  } catch {}
  return NextResponse.json({ result: { batchId, asOf, count: updates.length, items: updates, idempotent: false } })
}
