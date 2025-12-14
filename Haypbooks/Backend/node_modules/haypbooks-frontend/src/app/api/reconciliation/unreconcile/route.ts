import { NextResponse } from 'next/server'
import { getRoleFromCookies, hasPermission } from '@/lib/rbac-server'
import { db, seedIfNeeded } from '@/mock/db'

// Unreconcile a single transaction that was previously marked reconciled by a finished session.
// Guards:
// - Requires journal:write permission
// - txn must exist and currently be marked reconciled
// - Optionally verifies it belongs to the provided accountId when supplied
// - Does not post journals; flips reconciled flag off and records an audit via existing patterns
export async function POST(req: Request) {
  const role = getRoleFromCookies()
  if (!hasPermission(role, 'journal:write')) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  if (!db.seeded) { try { seedIfNeeded() } catch {} }
  const body = await req.json().catch(() => ({}))
  const { txnId, accountId } = body || {}
  if (!txnId) return NextResponse.json({ error: 'txnId required' }, { status: 400 })
  const t = db.transactions.find(tr => tr.id === txnId)
  if (!t) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  if (accountId && t.accountId !== accountId) return NextResponse.json({ error: 'transaction does not belong to account' }, { status: 400 })
  if (!(t as any).reconciled) return NextResponse.json({ error: 'transaction is not reconciled' }, { status: 400 })
  // Flip reconciled flags; maintain snapshot/session history for discrepancy detection
  const before = { ...t }
  ;(t as any).reconciled = false
  ;(t as any).reconciledAt = undefined
  // Soft audit via db.auditEvents to mirror existing patterns
  try {
    // lazy import to avoid circular typing; recordAudit is internal, so push directly to auditEvents
    ;(db.auditEvents ||= []).push({
      id: `aud_${Date.now().toString(36)}`,
      ts: new Date().toISOString(),
      actor: 'system',
      action: 'reconcile:unreconcile',
      entityType: 'transaction',
      entityId: t.id,
      before,
      after: { ...t },
    } as any)
  } catch {}
  return NextResponse.json({ ok: true })
}
