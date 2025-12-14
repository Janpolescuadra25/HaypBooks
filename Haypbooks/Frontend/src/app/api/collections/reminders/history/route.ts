import { NextResponse } from 'next/server'
import { getRoleFromCookies, hasPermission } from '@/lib/rbac-server'
import { db, seedIfNeeded } from '@/mock/db'

// GET /api/collections/reminders/history?start=YYYY-MM-DD&end=YYYY-MM-DD&customerId=...&invoiceId=...
// Returns reminder audit events (invoice:reminder) within optional date range (by lastReminderDate in after) and filters.
export async function GET(req: Request) {
  const role = getRoleFromCookies()
  // Require both audit:read (to view audit events) and reports:read (to download/report)
  if (!hasPermission(role, 'audit:read') || !hasPermission(role, 'reports:read')) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  seedIfNeeded()
  const url = new URL(req.url)
  const start = url.searchParams.get('start') || null
  const end = url.searchParams.get('end') || null
  const customerId = url.searchParams.get('customerId') || null
  const invoiceId = url.searchParams.get('invoiceId') || null
  const events = (db.auditEvents || []).filter((e: any) => e?.action === 'invoice:reminder') as any[]
  const rows = [] as any[]
  for (const ev of events) {
    const a = ev.after || {}
    const lr = a.lastReminderDate || a.lastReminder || null
    if (start && (!lr || lr < start)) continue
    if (end && (!lr || lr > end)) continue
    if (customerId && a.customerId !== customerId) continue
    if (invoiceId && a.invoiceId !== invoiceId) continue
    rows.push({
      ts: ev.ts,
      invoiceId: a.invoiceId,
      customerId: a.customerId,
      lastReminderDate: lr,
      reminderCount: a.reminderCount,
      dunningStage: a.dunningStage,
      batchId: a.batchId || ev.meta?.batchId || null
    })
  }
  // Sort newest first by ts
  rows.sort((a,b)=> (b.ts||'').localeCompare(a.ts||''))
  return NextResponse.json({ history: { start, end, customerId, invoiceId, count: rows.length, rows } })
}
