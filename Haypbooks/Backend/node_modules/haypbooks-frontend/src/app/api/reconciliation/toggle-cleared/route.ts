import { NextResponse } from 'next/server'
import { getRoleFromCookies, hasPermission } from '@/lib/rbac-server'
import { db, seedIfNeeded } from '@/mock/db'

export async function POST(req: Request) {
  const role = getRoleFromCookies()
  // Toggling cleared state affects reconciliation and should require write-level permission
  if (!hasPermission(role, 'journal:write')) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  if (!db.seeded) { try { seedIfNeeded() } catch {} }
  const body = await req.json().catch(() => ({}))
  const { id, cleared, accountId, periodEnd } = body || {}
  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 })
  if (!accountId) return NextResponse.json({ error: 'accountId required' }, { status: 400 })
  const t = db.transactions.find(tr => tr.id === id)
  if (!t) return NextResponse.json({ error: 'not found' }, { status: 404 })
  if (t.accountId !== accountId) return NextResponse.json({ error: 'transaction does not belong to account' }, { status: 400 })
  if (periodEnd) {
    const d = String(t.date || '').slice(0,10)
    const pe = String(periodEnd).slice(0,10)
    if (d > pe) return NextResponse.json({ error: 'transaction date after period end' }, { status: 400 })
  }
  // Prevent toggling items already marked as reconciled by a finished session without undo
  if ((t as any).reconciled) return NextResponse.json({ error: 'transaction is reconciled; undo session first' }, { status: 400 })
  ;(t as any).cleared = Boolean(cleared)
  return NextResponse.json({ ok: true })
}
