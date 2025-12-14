import { NextResponse } from 'next/server'
import { getRoleFromCookies, hasPermission } from '@/lib/rbac-server'
import { db } from '@/mock/db'

// POST /api/collections/reminders/batch/progress?batchId=...
// Advances simulated reminder batch status queued -> processing -> sent. Emits audit audit events.

const SEQ: Array<'queued'|'processing'|'sent'> = ['queued','processing','sent']

export async function POST(req: Request) {
  const role = getRoleFromCookies()
  if (!hasPermission(role, 'collections:send')) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  const url = new URL(req.url)
  const batchId = url.searchParams.get('batchId') || ''
  if (!batchId) return NextResponse.json({ error: 'batchId required' }, { status: 400 })
  const wrapper = (db.auditEvents || []).find((e: any) => e.action === 'reminder:send:batch' && e.entityId === batchId)
  if (!wrapper) return NextResponse.json({ error: 'Batch not found' }, { status: 404 })
  ;(db as any).reminderBatchStatuses ||= {}
  let current: any = (db as any).reminderBatchStatuses[batchId] || 'queued'
  const idx = SEQ.indexOf(current)
  let changed = false
  if (idx < SEQ.length - 1) {
    current = SEQ[idx + 1]
  ;(db as any).reminderBatchStatuses[batchId] = current
    changed = true
    const ts = new Date().toISOString()
    ;(db.auditEvents ||= []).push({
      id: `aud_${Date.now().toString(36)}_${Math.random().toString(36).slice(2,6)}`,
      ts,
      actor: 'system',
      action: 'reminder:send:batch:status',
      entityType: 'collections-batch',
      entityId: batchId,
      after: { batchId, status: current },
      meta: { scope: 'ar' }
    } as any)
  }
  return NextResponse.json({ result: { batchId, status: current, changed } })
}
