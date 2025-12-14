import { NextResponse } from 'next/server'
import { getRoleFromCookies, hasPermission } from '@/lib/rbac-server'
import { db } from '@/mock/db'
import '@/mock/seed'

type Row = {
  number?: string
  name?: string
  type?: string
  detailType?: string
  parentNumber?: string
  reconcilable?: boolean | string
  openingBalance?: number | string
  openingBalanceDate?: string
}

function normalizeType(t: any): 'Asset'|'Liability'|'Equity'|'Income'|'Expense'|null {
  const v = String(t || '').trim().toLowerCase()
  const map: Record<string, any> = { asset: 'Asset', liability: 'Liability', equity: 'Equity', income: 'Income', revenue: 'Income', expense: 'Expense' }
  return map[v] || null
}

function hasActivityOrChildren(acc: any) {
  return (db.transactions || []).some((t: any) => t.accountId === acc.id)
    || (db.journalEntries || []).some((j: any) => j.lines?.some((l: any) => l.accountId === acc.id))
    || (db.reconcileSessions || []).some((s: any) => s.accountId === acc.id)
    || (db.accounts || []).some((a: any) => a.parentId === acc.id)
}

function audit(action: string, entityId: string, before?: any, after?: any, meta?: any) {
  try { (db as any).auditEvents ||= []; (db as any).auditEvents.push({ id: `aud_${Date.now()}_${Math.random().toString(36).slice(2,6)}`, ts: new Date().toISOString(), actor: 'system', action, entityType: 'account', entityId, before, after, meta }) } catch {}
}

export async function POST(req: Request) {
  const role = getRoleFromCookies()
  if (!hasPermission(role, 'journal:write')) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  const body = await req.json().catch(() => null) as { rows?: Row[] } | null
  if (!body || !Array.isArray(body.rows)) return NextResponse.json({ error: 'rows required' }, { status: 400 })

  // Index existing by number for upsert
  const byNumber = new Map<string, any>()
  for (const a of (db.accounts || [])) byNumber.set(a.number, a)

  // Prepare normalized rows and quick lookup of batch parents
  const items = body.rows.map((r, index) => {
    const number = String(r?.number || '').trim()
    const name = String(r?.name || '').trim()
    const type = normalizeType(r?.type)
    const detailType = r?.detailType ? String(r.detailType).trim() : undefined
    const parentNumber = r?.parentNumber ? String(r.parentNumber).trim() : undefined
    const reconcilableRaw = (r as any)?.reconcilable
    const reconcilable = typeof reconcilableRaw === 'string' ? /^(true|yes|1)$/i.test(reconcilableRaw) : !!reconcilableRaw
    const openingBalance = typeof r?.openingBalance !== 'undefined' ? Number(r.openingBalance) : undefined
    const openingBalanceDate = typeof r?.openingBalanceDate !== 'undefined' && r.openingBalanceDate ? String(r.openingBalanceDate).slice(0,10) : undefined
    return { index, number, name, type, detailType, parentNumber, reconcilable, openingBalance, openingBalanceDate }
  })

  // Validation helper
  function validate(it: any, existing?: any) {
    const errs: string[] = []
    if (!/^[0-9]{3,6}$/.test(it.number)) errs.push('number must be 3–6 digits')
    if (!it.name) errs.push('name required')
    if (!it.type) errs.push('invalid type')
    if (typeof it.openingBalance !== 'undefined' || typeof it.openingBalanceDate !== 'undefined') {
      if (it.type === 'Income' || it.type === 'Expense') errs.push('opening balance not allowed for Income/Expense')
      if (typeof it.openingBalance !== 'undefined' && Number.isNaN(Number(it.openingBalance))) errs.push('invalid openingBalance')
      if (typeof it.openingBalanceDate !== 'undefined' && it.openingBalanceDate && !/^\d{4}-\d{2}-\d{2}$/.test(it.openingBalanceDate)) errs.push('invalid openingBalanceDate (YYYY-MM-DD)')
    }
    // reconcilable only for Asset/Liability
    if (it.reconcilable && !(it.type === 'Asset' || it.type === 'Liability')) errs.push('reconcilable only allowed for Asset/Liability')
    // type change guard on updates
    if (existing && it.type && existing.type !== it.type) {
      if (hasActivityOrChildren(existing)) errs.push('cannot change type on account with activity/children')
    }
    return errs
  }

  // We need to resolve parents; process in rounds allowing parent rows to be created first
  const pending = new Set<number>(items.map(x => x.index))
  const results: Array<{ index: number; action: 'create'|'update'|'skip'|'error'; id?: string; errors?: string[] }> = []
  let progress = true
  while (pending.size > 0 && progress) {
    progress = false
    for (const index of Array.from(pending)) {
      const it = items[index]
      const existing = byNumber.get(it.number)
      const errs = validate(it, existing)
      // Parent lookup if provided
      let parent: any | undefined
      if (it.parentNumber) {
        parent = byNumber.get(it.parentNumber)
        if (!parent) {
          // Parent may still be pending in batch; skip for now
          continue
        }
        if (parent.type !== it.type) errs.push('parent type must match')
      }
      if (errs.length > 0) {
        results.push({ index, action: 'error', errors: errs })
        pending.delete(index)
        progress = true
        continue
      }

      if (!existing) {
        // Create
        const id = `acc_${Math.random().toString(36).slice(2,8)}`
        const reconcilable = it.reconcilable === true && (it.type === 'Asset' || it.type === 'Liability')
        const acc: any = { id, number: it.number, name: it.name, type: it.type, active: true, reconcilable, balance: Number(it.openingBalance || 0), openingBalanceDate: it.openingBalanceDate, parentId: parent?.id, detailType: it.detailType }
        db.accounts.push(acc)
        byNumber.set(acc.number, acc)
        audit('account:create', id, undefined, { ...acc })
        results.push({ index, action: 'create', id })
      } else {
        // Update idempotently; compute next values and no-op if unchanged
        const before = { ...existing }
        const next: any = { ...existing }
        next.name = it.name
        next.detailType = it.detailType
        // reconcilable: only allowed for Asset/Liability; prevent turning off if reconciliation history exists
        if (typeof it.reconcilable === 'boolean') {
          const hasRec = (db.reconcileSessions || []).some((s: any) => s.accountId === existing.id)
          const req = it.reconcilable === true && (it.type === 'Asset' || it.type === 'Liability')
          if (!(hasRec && existing.reconcilable === true && req === false)) next.reconcilable = req
        }
        // Parent change: allow clearing or setting; prevent cycles
        if (typeof it.parentNumber !== 'undefined') {
          if (!it.parentNumber) {
            next.parentId = undefined
          } else {
            const p = byNumber.get(it.parentNumber)
            if (!p) {
              // Parent not yet processed; skip this round
              continue
            }
            if (p.id === existing.id) { results.push({ index, action: 'error', errors: ['account cannot be its own parent'] }); pending.delete(index); progress = true; continue }
            // cycle check
            let walker: any = p
            let cycle = false
            while (walker && walker.parentId) {
              if (walker.parentId === existing.id) { cycle = true; break }
              walker = (db.accounts || []).find((a: any) => a.id === walker.parentId)
            }
            if (cycle) { results.push({ index, action: 'error', errors: ['cannot set parent: cycle detected'] }); pending.delete(index); progress = true; continue }
            next.parentId = p.id
          }
        }
        // Opening balance/date updates only if no reconciliation sessions and not Income/Expense
        const hasRec = (db.reconcileSessions || []).some((s: any) => s.accountId === existing.id)
        if (!hasRec && !(it.type === 'Income' || it.type === 'Expense')) {
          if (typeof it.openingBalance !== 'undefined' && !Number.isNaN(Number(it.openingBalance))) next.balance = Number(it.openingBalance)
          if (typeof it.openingBalanceDate !== 'undefined') next.openingBalanceDate = it.openingBalanceDate || undefined
        }
        // If nothing changed, mark skip
        const changed = JSON.stringify({ ...before, balance: before.balance||0 }) !== JSON.stringify({ ...next, balance: next.balance||0 })
        if (!changed) {
          results.push({ index, action: 'skip', id: existing.id })
        } else {
          const idx = (db.accounts || []).findIndex((a: any) => a.id === existing.id)
          ;(db.accounts as any)[idx] = next
          audit('account:update', next.id, before, { ...next })
          results.push({ index, action: 'update', id: existing.id })
          byNumber.set(next.number, next)
        }
      }
      pending.delete(index)
      progress = true
    }
  }

  // Any remaining pending are unresolved due to missing parent references; mark as errors
  for (const index of Array.from(pending)) {
    results.push({ index, action: 'error', errors: ['parent not found in existing or batch'] })
  }

  const summary = {
    created: results.filter(r => r.action === 'create').length,
    updated: results.filter(r => r.action === 'update').length,
    skipped: results.filter(r => r.action === 'skip').length,
    errors: results.filter(r => r.action === 'error').length,
    total: results.length,
  }
  return NextResponse.json({ summary, results })
}
