import { NextResponse } from 'next/server'
import { getRoleFromCookies, hasPermission } from '@/lib/rbac-server'
import { db, seedIfNeeded, listReconcileSessions } from '@/mock/db'

export async function GET(req: Request) {
  if (!db.seeded) { try { seedIfNeeded() } catch {} }
  const role = getRoleFromCookies()
  if (!hasPermission(role, 'reports:read')) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  const url = new URL(req.url)
  const accountId = url.searchParams.get('accountId') || undefined
  const sessionId = url.searchParams.get('sessionId') || undefined
  if (!accountId && !sessionId) return NextResponse.json({ error: 'Provide accountId or sessionId' }, { status: 400 })

  let session: any
  if (sessionId) {
    session = (db.reconcileSessions || []).find(s => s.id === sessionId)
    if (!session) return NextResponse.json({ error: 'Session not found' }, { status: 404 })
  } else if (accountId) {
    const sessions = listReconcileSessions(accountId)
    session = sessions[sessions.length - 1]
    if (!session) return NextResponse.json({ discrepancies: [], session: null })
  }

  const snap = Array.isArray(session?.snapshot) ? session.snapshot as Array<{ id: string; date: string; amount: number }> : []
  // Build current map from transactions for same account
  const curMap = new Map<string, { date: string; amount: number; reconciled?: boolean }>()
  for (const t of db.transactions) {
    if (t.accountId !== session.accountId) continue
    curMap.set(t.id, { date: String(t.date||'').slice(0,10), amount: Number(t.amount||0), reconciled: (t as any).reconciled })
  }
  type Diff = {
    id: string
    status: 'missing' | 'changed' | 'unreconciled'
    snapDate?: string
    snapAmount?: number
    curDate?: string
    curAmount?: number
    actor?: string
    action?: string
    at?: string
    changeType?: 'amount_changed' | 'date_changed' | 'unreconciled' | 'deleted' | 'changed'
  }
  const diffs: Diff[] = []
  for (const s of snap) {
    const cur = curMap.get(s.id)
    let base: Diff
    if (!cur) {
      base = { id: s.id, status: 'missing', snapDate: s.date, snapAmount: s.amount, changeType: 'deleted' }
    } else {
      const amountChanged = Math.abs(Number(cur.amount||0) - Number(s.amount||0)) > 0.0001
      const dateChanged = (cur.date !== s.date)
      const changed = amountChanged || dateChanged
      if (changed) base = { id: s.id, status: 'changed', snapDate: s.date, snapAmount: s.amount, curDate: cur.date, curAmount: cur.amount, changeType: amountChanged ? 'amount_changed' : 'date_changed' }
      else if (!cur.reconciled) base = { id: s.id, status: 'unreconciled', snapDate: s.date, snapAmount: s.amount, curDate: cur.date, curAmount: cur.amount, changeType: 'unreconciled' }
      else base = { id: s.id, status: 'changed', snapDate: s.date, snapAmount: s.amount, curDate: cur.date, curAmount: cur.amount, changeType: 'changed' }
    }
    // Attach last audit metadata (prefer events after session creation)
    const events = (db.auditEvents || []).filter((e: any) => e && e.entityType === 'transaction' && e.entityId === s.id)
    let pick: any
    if (Array.isArray(events) && events.length > 0) {
      // Try to get last event at/after session createdAt; fallback to latest
      const after = events.filter(e => e.ts && session.createdAt && e.ts >= session.createdAt)
      pick = (after.length > 0 ? after : events).slice().sort((a,b)=> (a.ts||'').localeCompare(b.ts||''))[after.length > 0 ? after.length - 1 : events.length - 1]
      if (pick) { base.actor = pick.actor || undefined; base.action = pick.action || undefined; base.at = pick.ts || undefined }
    }
    diffs.push(base)
  }
  return NextResponse.json({
    session: { id: session.id, accountId: session.accountId, periodEnd: session.periodEnd },
    discrepancies: diffs,
  })
}
