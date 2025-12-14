import { NextResponse } from 'next/server'
import { getRoleFromCookies, hasPermission } from '@/lib/rbac-server'
import { db, seedIfNeeded } from '@/mock/db'

// POST /api/customers/statements/pack/send?asOf=YYYY-MM-DD[&customerId=c1,c2][&start=YYYY-MM-DD][&type=summary|detail]
// Queues a batch send of multiple customer statements.
// Audit events:
//  - Per-customer: action=statement:send (entityType=customer)
//  - Batch wrapper: action=statement:send:batch (entityType=statement-pack)

function isIsoDate(s: string) { return /^\d{4}-\d{2}-\d{2}$/.test(s) }

export async function POST(req: Request) {
  const role = getRoleFromCookies()
  if (!hasPermission(role, 'statements:send')) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  seedIfNeeded()
  const url = new URL(req.url)
  const asOf = url.searchParams.get('asOf') || new Date().toISOString().slice(0,10)
  const start = url.searchParams.get('start') || null
  const typeRaw = url.searchParams.get('type') || 'summary'
  const type = (typeRaw === 'summary' || typeRaw === 'detail') ? typeRaw : null
  const idsParam = url.searchParams.get('customerId') || ''
  const idList = idsParam.split(',').map(s => s.trim()).filter(Boolean)
  // When no explicit ids provided, default to all customers (mirrors pack aggregator logic)
  const customers = (db.customers || [])
  const targetIds = idList.length ? idList : customers.map(c => c.id)

  // Validation
  if (!isIsoDate(asOf) || (start && !isIsoDate(start)) || !type) {
    return NextResponse.json({ error: 'Invalid parameters', details: { asOf, start, type: typeRaw } }, { status: 400 })
  }
  // Existence validation only if db seeded (customers length > 0)
  if (customers.length > 0) {
    for (const id of targetIds) {
      if (!customers.some(c => c.id === id)) {
        return NextResponse.json({ error: 'Customer not found', id }, { status: 404 })
      }
    }
  }
  const queuedAt = new Date().toISOString()
  // Idempotency: find existing batch wrapper with same scope (asOf,start,type, sorted ids) within last 10 minutes
  const scopeKey = JSON.stringify({ asOf, start, type, ids: [...targetIds].sort() })
  let existing: any | undefined
  const tenMinutesAgo = Date.now() - 10 * 60 * 1000
  for (const ev of (db.auditEvents || []).filter((e: any) => e?.action === 'statement:send:batch')) {
    const tsMs = ev.ts ? Date.parse(ev.ts) : 0
    if (!tsMs || tsMs < tenMinutesAgo) continue
    const a = ev.after || {}
    const prevIds = (db.auditEvents || []).filter((c: any) => c?.meta?.batchId === ev.entityId && c?.action === 'statement:send').map((c: any) => c.after?.id).filter(Boolean).sort()
    const prevKey = JSON.stringify({ asOf: a.asOf, start: a.start, type: a.type, ids: prevIds })
    if (prevKey === scopeKey) { existing = ev; break }
  }
  if (existing) {
    return NextResponse.json({ result: { batchId: existing.entityId, asOf, start, type, queuedAt: existing.ts, count: existing.after?.count || targetIds.length, items: [], idempotent: true } })
  }
  const batchId = `stmt_batch_${Date.now().toString(36)}_${Math.random().toString(36).slice(2,6)}`
  const perCustomer: any[] = []
  try {
    for (const id of targetIds) {
      const messageId = `stmt_${Date.now().toString(36)}_${Math.random().toString(36).slice(2,8)}`
      const payload = { id, asOf, start, type, status: 'queued', queuedAt, messageId, batchId }
      perCustomer.push(payload)
      ;(db.auditEvents ||= []).push({
        id: `aud_${Date.now().toString(36)}_${Math.random().toString(36).slice(2,6)}`,
        ts: queuedAt,
        actor: 'system',
        action: 'statement:send',
        entityType: 'customer',
        entityId: id,
        after: payload,
        meta: { scope: 'ar', batchId }
      } as any)
    }
    // Batch wrapper event
    ;(db.auditEvents ||= []).push({
      id: `aud_${Date.now().toString(36)}_${Math.random().toString(36).slice(2,6)}`,
      ts: queuedAt,
      actor: 'system',
      action: 'statement:send:batch',
      entityType: 'statement-pack',
      entityId: batchId,
      after: { batchId, asOf, start, type, count: perCustomer.length, status: 'queued', queuedAt },
      meta: { scope: 'ar' }
    } as any)
  } catch {}

  return NextResponse.json({ result: { batchId, asOf, start, type, queuedAt, count: perCustomer.length, items: perCustomer, idempotent: false } })
}
