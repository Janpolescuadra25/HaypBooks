import { NextResponse } from 'next/server'
import { getRoleFromCookies, hasPermission } from '@/lib/rbac-server'
import { db, recalcAccountBalances } from '@/mock/db'
import '@/mock/seed'

type MergeBody = {
  sourceId: string
  targetId: string
  strategy?: 'inactivate' | 'delete'
}

const PROTECTED_NUMBERS = new Set(['1000','1010','1100','2000','4000','5000','6000'])

export async function POST(req: Request) {
  const role = getRoleFromCookies()
  if (!hasPermission(role, 'journal:write')) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }
  const body = (await req.json().catch(() => null)) as MergeBody | null
  if (!body || !body.sourceId || !body.targetId) {
    return NextResponse.json({ error: 'sourceId and targetId required' }, { status: 400 })
  }
  if (body.sourceId === body.targetId) {
    return NextResponse.json({ error: 'sourceId and targetId must differ' }, { status: 400 })
  }
  const source = (db.accounts || []).find(a => a.id === body.sourceId)
  const target = (db.accounts || []).find(a => a.id === body.targetId)
  if (!source) return NextResponse.json({ error: 'Source account not found' }, { status: 404 })
  if (!target) return NextResponse.json({ error: 'Target account not found' }, { status: 404 })
  if (source.type !== target.type) return NextResponse.json({ error: 'Accounts must be the same type to merge' }, { status: 400 })
  if (PROTECTED_NUMBERS.has(source.number)) return NextResponse.json({ error: 'Cannot merge from a protected system account' }, { status: 400 })
  if (target.active === false) return NextResponse.json({ error: 'Target account must be active' }, { status: 400 })

  // Rewrite references: transactions.accountId, journalEntries.lines[].accountId, items.defaultAccountId, reconcileSessions.accountId
  let txns = 0, jlines = 0, items = 0, recs = 0
  for (const t of db.transactions) {
    if (t.accountId === source.id) { t.accountId = target.id; txns++ }
  }
  for (const j of (db.journalEntries || [])) {
    for (const l of j.lines) {
      if (l.accountId === source.id) { l.accountId = target.id; jlines++ }
    }
  }
  for (const it of (db.items || [])) {
    if ((it as any).defaultAccountId === source.id) { (it as any).defaultAccountId = target.id; items++ }
  }
  for (const r of (db.reconcileSessions || [])) {
    if (r.accountId === source.id) { r.accountId = target.id; recs++ }
  }

  // Recompute balances based on transactions
  recalcAccountBalances()

  // Apply strategy to source: default inactivate; optionally delete if requested and safe
  const strategy = body.strategy || 'inactivate'
  if (strategy === 'delete') {
    // ensure source is no longer referenced
    const stillUsed = db.transactions.some(t => t.accountId === source.id)
      || (db.journalEntries || []).some(j => j.lines.some(l => l.accountId === source.id))
      || (db.items || []).some((it: any) => it.defaultAccountId === source.id)
      || (db.reconcileSessions || []).some(r => r.accountId === source.id)
    if (stillUsed) {
      return NextResponse.json({ error: 'Source account still referenced; cannot delete' }, { status: 400 })
    }
    const idx = db.accounts.findIndex(a => a.id === source.id)
    if (idx >= 0) db.accounts.splice(idx, 1)
  } else {
    // mark inactive and annotate name for clarity (non-breaking)
    source.active = false
    if (!/\(merged\)/i.test(source.name)) source.name = `${source.name} (merged)`
  }

  // Lightweight audit entry
  try {
    ;(db.auditEvents ||= []).push({ id: `aud_${Date.now()}`, ts: new Date().toISOString(), actor: 'system', action: 'account:merge', entityType: 'account', entityId: target.id, meta: { sourceId: body.sourceId, targetId: body.targetId, txns, jlines, items, recs, strategy } })
  } catch {}

  return NextResponse.json({ ok: true, summary: { txns, journalLines: jlines, items, reconcileSessions: recs }, target: { id: target.id, number: target.number, name: target.name } })
}
