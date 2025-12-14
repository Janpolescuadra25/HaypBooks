import { NextResponse } from 'next/server'
import { getRoleFromCookies, hasPermission } from '@/lib/rbac-server'
import { db } from '@/mock/db'
import '@/mock/seed'

type Account = {
  id: string
  number: string
  name: string
  type: 'Asset' | 'Liability' | 'Equity' | 'Income' | 'Expense'
  active?: boolean
  reconcilable?: boolean
  openingBalance?: number
  openingBalanceDate?: string
  // New optional metadata for sub-accounts and finer categorization
  parentId?: string
  detailType?: string
}

function normalizeType(t: any): Account['type'] | null {
  const v = String(t || '').trim()
  const map: Record<string, Account['type']> = {
    asset: 'Asset', liability: 'Liability', equity: 'Equity', income: 'Income', revenue: 'Income', expense: 'Expense',
  }
  const key = v.toLowerCase()
  return (map[key] as Account['type']) || null
}

function sortAccounts(list: Account[]) {
  return list.slice().sort((a, b) => (a.number === b.number ? a.name.localeCompare(b.name) : a.number.localeCompare(b.number)))
}

export async function GET(req: Request) {
  const role = getRoleFromCookies()
  if (!hasPermission(role, 'journal:read')) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }
  const url = new URL(req.url)
  const q = (url.searchParams.get('q') || '').toLowerCase().trim()
  const includeInactive = url.searchParams.get('includeInactive') === '1'
  const includeBalances = url.searchParams.get('includeBalances') === '1'
  const asOfParam = url.searchParams.get('asOf')
  const asOf = asOfParam ? String(asOfParam).slice(0,10) : null
  const onlyReconcilable = url.searchParams.get('reconcilable') === '1'
  const id = url.searchParams.get('id') || ''

  // Optional: compute balances as of a specific date using journal entries
  let balancesById: Record<string, number> | null = null
  if (includeBalances && asOf) {
    try {
      const accounts = db.accounts || []
      const journalEntries = db.journalEntries || []
      const map: Record<string, number> = {}
      accounts.forEach((acc: any) => { map[acc.id] = 0 })
      journalEntries.forEach((je: any) => {
        const entryDate = String(je.date || '').slice(0,10)
        if (entryDate && entryDate <= asOf) {
          (je.lines || []).forEach((line: any) => {
            const cur = map[line.accountId] || 0
            const net = Number(line.debit || 0) - Number(line.credit || 0)
            map[line.accountId] = cur + net
          })
        }
      })
      balancesById = map
    } catch {
      balancesById = null
    }
  }

  let results: Account[] & Array<any> = (db.accounts || []).map((a: any) => ({
    id: a.id,
    number: a.number,
    name: a.name,
    type: a.type,
    active: a.active !== false,
    reconcilable: a.reconcilable === true,
    openingBalanceDate: a.openingBalanceDate || undefined,
    parentId: a.parentId || undefined,
    parentNumber: a.parentId ? ((db.accounts || []).find((p: any) => p.id === a.parentId)?.number) : undefined,
    detailType: a.detailType || undefined,
    ...(includeBalances ? { balance: (balancesById ? Number(balancesById[a.id] || 0) : Number(a.balance || 0)) } : {})
  }))

  if (id) {
    const item = results.find(a => a.id === id)
    if (!item) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json({ item, items: [item] })
  }

  if (q) {
    results = results.filter(
      (a) => a.number.toLowerCase().includes(q) || a.name.toLowerCase().includes(q) || `${a.number} · ${a.name}`.toLowerCase().includes(q)
    )
  }

  if (!includeInactive) {
    results = results.filter(a => a.active !== false)
  }

  if (onlyReconcilable) {
    results = results.filter(a => a.reconcilable === true)
  }

  results = sortAccounts(results)
  return NextResponse.json({ accounts: results, total: results.length })
}

export async function POST(req: Request) {
  const role = getRoleFromCookies()
  if (!hasPermission(role, 'journal:write')) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }
  const body = (await req.json().catch(() => null)) as (Partial<Account> & { parentNumber?: string }) | null
  if (!body || !body.number || !body.name || !body.type) {
    return NextResponse.json({ error: 'number, name, type are required' }, { status: 400 })
  }
  const type = normalizeType(body.type)
  if (!type) return NextResponse.json({ error: 'Invalid account type' }, { status: 400 })
  const number = String(body.number).trim()
  if (!/^\d{3,6}$/.test(number)) return NextResponse.json({ error: 'Account number must be 3-6 digits' }, { status: 400 })
  if ((db.accounts || []).some((a: any) => a.number === number)) return NextResponse.json({ error: 'Account number already exists' }, { status: 400 })
  // Parent handling (optional): allow specifying parentNumber or parentId; types must match
  let parentId: string | undefined
  if (body.parentId || body.parentNumber) {
    const parent = (db.accounts || []).find((a: any) => (body.parentId ? a.id === body.parentId : a.number === body.parentNumber))
    if (!parent) return NextResponse.json({ error: 'Parent account not found' }, { status: 400 })
    if (parent.type !== type) return NextResponse.json({ error: 'Parent account type must match' }, { status: 400 })
    parentId = parent.id
  }
  // Reconcilable guard: only balance-holding accounts should be reconcilable
  const reconcilable = body.reconcilable === true && (type === 'Asset' || type === 'Liability')
  // Opening balance rules: only allowed for balance-holding accounts (not Income/Expense)
  let openingBalance: number | undefined
  let openingBalanceDate: string | undefined
  if (body.openingBalance !== undefined || body.openingBalanceDate) {
    if (type === 'Income' || type === 'Expense') {
      return NextResponse.json({ error: 'Opening balance is not allowed for Income or Expense accounts' }, { status: 400 })
    }
    if (body.openingBalance !== undefined) {
      const ob = Number(body.openingBalance)
      if (Number.isNaN(ob)) return NextResponse.json({ error: 'Invalid openingBalance' }, { status: 400 })
      openingBalance = ob
    }
    if (body.openingBalanceDate) {
      const d = String(body.openingBalanceDate).slice(0,10)
      if (!/^\d{4}-\d{2}-\d{2}$/.test(d)) return NextResponse.json({ error: 'Invalid openingBalanceDate (YYYY-MM-DD)' }, { status: 400 })
      openingBalanceDate = d
    }
  }
  const id = `acc_${Math.random().toString(36).slice(2,8)}`
  const acc = { id, number, name: String(body.name).trim(), type, balance: Number(openingBalance || 0), openingBalanceDate, active: true, reconcilable, parentId, detailType: body.detailType }
  db.accounts.push(acc as any)
  try { (db as any).auditEvents ||= []; (db as any).auditEvents.push({ id: `aud_${Date.now()}`, ts: new Date().toISOString(), actor: 'system', action: 'account:create', entityType: 'account', entityId: id, after: { ...acc } }) } catch {}
  return NextResponse.json({ account: { id, number, name: acc.name, type, active: true, reconcilable: reconcilable === true, openingBalanceDate, parentId, detailType: acc.detailType } })
}

export async function PUT(req: Request) {
  const role = getRoleFromCookies()
  if (!hasPermission(role, 'journal:write')) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }
  const body = (await req.json().catch(() => null)) as (Partial<Account> & { id?: string; parentNumber?: string }) | null
  if (!body || !body.id) return NextResponse.json({ error: 'id required' }, { status: 400 })
  const idx = (db.accounts || []).findIndex((a: any) => a.id === body.id)
  if (idx === -1) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  const current = (db.accounts as any)[idx]
  const nextType = body.type ? normalizeType(body.type) : (current.type as Account['type'])
  if (body.type && !nextType) return NextResponse.json({ error: 'Invalid account type' }, { status: 400 })
  // Guard: prevent changing account type if the account has historical activity
  if (body.type && nextType !== current.type) {
    const hasActivity = (db.transactions || []).some((t: any) => t.accountId === current.id)
      || (db.journalEntries || []).some((j: any) => j.lines?.some((l: any) => l.accountId === current.id))
      || (db.reconcileSessions || []).some((s: any) => s.accountId === current.id)
      || (db.accounts || []).some((a: any) => a.parentId === current.id) // has children
    if (hasActivity) {
      return NextResponse.json({ error: 'Cannot change account type after activity/child links exist. Create a new account and merge if needed.' }, { status: 400 })
    }
  }
  const nextNumber = body.number ? String(body.number).trim() : current.number
  if (!/^\d{3,6}$/.test(nextNumber)) return NextResponse.json({ error: 'Account number must be 3-6 digits' }, { status: 400 })
  if ((db.accounts || []).some((a: any, i: number) => i !== idx && a.number === nextNumber)) {
    return NextResponse.json({ error: 'Account number already exists' }, { status: 400 })
  }
  // Parent change (optional): ensure type match and prevent cycles
  let nextParentId: string | undefined = current.parentId
  if (body.parentId !== undefined || body.parentNumber !== undefined) {
    if (body.parentId === null || body.parentNumber === '') {
      nextParentId = undefined
    } else {
      const parent = (db.accounts || []).find((a: any) => (body.parentId ? a.id === body.parentId : a.number === body.parentNumber))
      if (!parent) return NextResponse.json({ error: 'Parent account not found' }, { status: 400 })
      if (parent.id === current.id) return NextResponse.json({ error: 'Account cannot be its own parent' }, { status: 400 })
      const effType = nextType
      if (parent.type !== effType) return NextResponse.json({ error: 'Parent account type must match' }, { status: 400 })
      // Cycle guard: walk up parents to ensure current is not an ancestor of parent
      let walker: any = parent
      while (walker && walker.parentId) {
        if (walker.parentId === current.id) return NextResponse.json({ error: 'Cannot set parent: cycle detected' }, { status: 400 })
        walker = (db.accounts || []).find((a: any) => a.id === walker.parentId)
      }
      nextParentId = parent.id
    }
  }
  // Optional active toggle with guard for protected system accounts
  let nextActive = (current.active !== false)
  if (typeof body.active === 'boolean') {
    const protectedNumbers = new Set(['1000','1010','1100','2000','4000','5000','6000'])
    if (body.active === false && protectedNumbers.has(current.number)) {
      return NextResponse.json({ error: 'Cannot inactivate a protected system account' }, { status: 400 })
    }
    nextActive = body.active
  }
  // Allow toggling reconcilable only for Asset/Liability types
  let nextReconcilable = current.reconcilable === true
  if (typeof body.reconcilable === 'boolean') {
    const requested = body.reconcilable === true && (nextType === 'Asset' || nextType === 'Liability')
    // Prevent turning off reconcilable if reconciliation history exists
    const hasReconSessions = (db.reconcileSessions || []).some((s: any) => s.accountId === current.id)
    if (hasReconSessions && current.reconcilable === true && requested === false) {
      return NextResponse.json({ error: 'Cannot make this account non-reconcilable because it has reconciliation history' }, { status: 400 })
    }
    nextReconcilable = requested
  }
  // Opening balance/date can be set only if the account has never been reconciled
  const hasReconSessions = (db.reconcileSessions || []).some((s: any) => s.accountId === current.id)
  let nextBalance = current.balance || 0
  let nextOpeningDate = current.openingBalanceDate
  if (body.openingBalance !== undefined || body.openingBalanceDate !== undefined) {
    if (nextType === 'Income' || nextType === 'Expense') {
      return NextResponse.json({ error: 'Opening balance is not allowed for Income or Expense accounts' }, { status: 400 })
    }
    if (hasReconSessions) {
      return NextResponse.json({ error: 'Cannot edit opening balance after reconciliation exists. Undo prior reconciliation first.' }, { status: 400 })
    }
    if (body.openingBalance !== undefined) {
      const ob = Number(body.openingBalance)
      if (Number.isNaN(ob)) return NextResponse.json({ error: 'Invalid openingBalance' }, { status: 400 })
      nextBalance = ob
    }
    if (body.openingBalanceDate !== undefined) {
      if (body.openingBalanceDate) {
        const d = String(body.openingBalanceDate).slice(0,10)
        if (!/^\d{4}-\d{2}-\d{2}$/.test(d)) return NextResponse.json({ error: 'Invalid openingBalanceDate (YYYY-MM-DD)' }, { status: 400 })
        nextOpeningDate = d
      } else {
        nextOpeningDate = undefined
      }
    }
  }
  const before = { ...current }
  const next = { ...current, number: nextNumber, name: body.name ? String(body.name).trim() : current.name, type: nextType, active: nextActive, reconcilable: nextReconcilable, balance: nextBalance, openingBalanceDate: nextOpeningDate, parentId: nextParentId, detailType: (body.detailType !== undefined ? body.detailType : current.detailType) }
  ;(db.accounts as any)[idx] = next
  try { (db as any).auditEvents ||= []; (db as any).auditEvents.push({ id: `aud_${Date.now()}`, ts: new Date().toISOString(), actor: 'system', action: 'account:update', entityType: 'account', entityId: next.id, before, after: { ...next } }) } catch {}
  return NextResponse.json({ account: { id: next.id, number: next.number, name: next.name, type: next.type, active: next.active !== false, reconcilable: next.reconcilable === true, openingBalanceDate: next.openingBalanceDate, parentId: next.parentId, detailType: next.detailType } })
}

export async function DELETE(req: Request) {
  const role = getRoleFromCookies()
  if (!hasPermission(role, 'journal:write')) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }
  const url = new URL(req.url)
  let id = url.searchParams.get('id')
  if (!id) {
    const body = (await req.json().catch(() => null)) as { id?: string } | null
    id = body?.id || ''
  }
  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 })
  const idx = (db.accounts || []).findIndex((a: any) => a.id === id)
  if (idx === -1) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  const acc = (db.accounts as any)[idx]
  // Guard: prevent deleting a parent account that still has children
  if ((db.accounts || []).some((a: any) => a.parentId === acc.id)) {
    return NextResponse.json({ error: 'Cannot delete an account that has sub-accounts. Reparent or remove children first.' }, { status: 400 })
  }
  // Guard: prevent deleting key system accounts commonly used in seeded data and flows
  const protectedNumbers = new Set(['1000','1010','1100','2000','4000','5000','6000'])
  if (protectedNumbers.has(acc.number)) return NextResponse.json({ error: 'Cannot delete a protected system account' }, { status: 400 })
  // Guard: prevent deletion if referenced by transactions or journal entries or items
  if ((db.transactions || []).some((t: any) => t.accountId === acc.id)) return NextResponse.json({ error: 'Account is in use by transactions' }, { status: 400 })
  if ((db.journalEntries || []).some((j: any) => j.lines?.some((l: any) => l.accountId === acc.id))) return NextResponse.json({ error: 'Account is in use by journal entries' }, { status: 400 })
  if ((db.items || []).some((it: any) => it.defaultAccountId === acc.id)) return NextResponse.json({ error: 'Account is assigned to items' }, { status: 400 })
  const before = { ...(db.accounts as any)[idx] }
  ;(db.accounts as any).splice(idx, 1)
  try { (db as any).auditEvents ||= []; (db as any).auditEvents.push({ id: `aud_${Date.now()}`, ts: new Date().toISOString(), actor: 'system', action: 'account:delete', entityType: 'account', entityId: id, before }) } catch {}
  return NextResponse.json({ ok: true })
}

