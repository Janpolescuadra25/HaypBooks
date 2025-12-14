import { NextResponse } from 'next/server'
import { getRoleFromCookies, hasPermission } from '@/lib/rbac-server'
import { db } from '@/mock/db'

// POST /api/customers/statements/pack/send/progress?batchId=...
// Advances simulated batch status queued -> processing -> sent. Emits audit events per transition.

const SEQ: Array<'queued'|'processing'|'sent'> = ['queued','processing','sent']

export async function POST(req: Request) {
  const role = getRoleFromCookies()
  if (!hasPermission(role, 'statements:send')) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  const url = new URL(req.url)
  const batchId = url.searchParams.get('batchId') || ''
  if (!batchId) return NextResponse.json({ error: 'batchId required' }, { status: 400 })
  // Find wrapper audit event
  const wrapper = (db.auditEvents || []).find((e: any) => e.action === 'statement:send:batch' && e.entityId === batchId)
  if (!wrapper) return NextResponse.json({ error: 'Batch not found' }, { status: 404 })
  ;(db as any).batchStatuses ||= {}
  let current: any = (db as any).batchStatuses[batchId] || 'queued'
  const idx = SEQ.indexOf(current)
  let changed = false
  if (idx < SEQ.length - 1) {
    current = SEQ[idx + 1]
  ;(db as any).batchStatuses[batchId] = current
    changed = true
    // Emit status audit event
    const ts = new Date().toISOString()
    ;(db.auditEvents ||= []).push({
      id: `aud_${Date.now().toString(36)}_${Math.random().toString(36).slice(2,6)}`,
      ts,
      actor: 'system',
      action: 'statement:send:batch:status',
      entityType: 'statement-pack',
      entityId: batchId,
      after: { batchId, status: current },
      meta: { scope: 'ar' }
    } as any)
  }
  return NextResponse.json({ result: { batchId, status: current, changed } })
}
