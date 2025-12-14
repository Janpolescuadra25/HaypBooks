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

export async function POST(req: Request) {
  const role = getRoleFromCookies()
  if (!hasPermission(role, 'journal:write')) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  const body = await req.json().catch(() => null) as { rows?: Row[] } | null
  if (!body || !Array.isArray(body.rows)) return NextResponse.json({ error: 'rows required' }, { status: 400 })

  // Index existing accounts by number for upsert detection
  const byNumber = new Map<string, any>()
  for (const a of (db.accounts || [])) byNumber.set(a.number, a)

  // Also collect batch-provided numbers to allow parent lookups within the batch
  const batchMap = new Map<string, Row>()
  for (const r of body.rows) { if (r?.number) batchMap.set(String(r.number).trim(), r) }

  const out: Array<{ index: number; action: 'create'|'update'|'skip'; errors: string[]; warnings: string[]; normalized?: any }> = []
  let creates = 0, updates = 0, errorsCount = 0

  for (let i = 0; i < body.rows.length; i++) {
    const r = body.rows[i] || {}
    const errs: string[] = []
    const warns: string[] = []
    const number = String(r.number || '').trim()
    const name = String(r.name || '').trim()
    const type = normalizeType(r.type)
    if (!/^[0-9]{3,6}$/.test(number)) errs.push('number must be 3–6 digits')
    if (!name) errs.push('name required')
    if (!type) errs.push('invalid type')

    // Determine if this will be create or update
    const existing = number ? byNumber.get(number) : undefined
    let action: 'create'|'update'|'skip' = existing ? 'update' : 'create'

    // Parent validation (optional)
    let parentNumber: string | undefined = undefined
    if (r.parentNumber) parentNumber = String(r.parentNumber).trim()
    if (parentNumber) {
      // Find parent in existing or batch
      const parent = byNumber.get(parentNumber) || (batchMap.get(parentNumber) && byNumber.get(String((batchMap.get(parentNumber) as any).number))) || undefined
      if (!parent) {
        // Parent might be in the same batch but not in existing yet — allow if the parent row exists in batch
        if (!batchMap.has(parentNumber)) errs.push('parent not found')
      } else {
        if (parent.type && type && parent.type !== type) errs.push('parent type must match')
      }
    }

    // Reconcilable normalization/validation
    let reconcilable: boolean | undefined
    if (typeof r.reconcilable !== 'undefined') {
      const v = typeof r.reconcilable === 'string' ? /^(true|yes|1)$/i.test(r.reconcilable) : !!r.reconcilable
      if (v && !(type === 'Asset' || type === 'Liability')) errs.push('reconcilable only allowed for Asset/Liability')
      else reconcilable = v && (type === 'Asset' || type === 'Liability')
    }

    // Opening balance / date validation
    let openingBalance: number | undefined
    let openingBalanceDate: string | undefined
    if (typeof r.openingBalance !== 'undefined' || typeof r.openingBalanceDate !== 'undefined') {
      if (type === 'Income' || type === 'Expense') errs.push('opening balance not allowed for Income/Expense')
      if (typeof r.openingBalance !== 'undefined') {
        const ob = Number(r.openingBalance)
        if (Number.isNaN(ob)) errs.push('invalid openingBalance')
        else openingBalance = ob
      }
      if (typeof r.openingBalanceDate !== 'undefined') {
        if (r.openingBalanceDate) {
          const d = String(r.openingBalanceDate).slice(0,10)
          if (!/^\d{4}-\d{2}-\d{2}$/.test(d)) errs.push('invalid openingBalanceDate (YYYY-MM-DD)')
          else openingBalanceDate = d
        }
      }
    }

    // If updating, warn if type is changing on an account that appears to have activity
    if (action === 'update' && existing) {
      if (type && existing.type && type !== existing.type) {
        const hasActivity = (db.transactions || []).some((t: any) => t.accountId === existing.id)
          || (db.journalEntries || []).some((j: any) => j.lines?.some((l: any) => l.accountId === existing.id))
          || (db.reconcileSessions || []).some((s: any) => s.accountId === existing.id)
          || (db.accounts || []).some((a: any) => a.parentId === existing.id)
        if (hasActivity) errs.push('cannot change type on account with activity/children')
      }
    }

    const normalized = { number, name, type, detailType: r.detailType ? String(r.detailType).trim() : undefined, parentNumber, reconcilable, openingBalance, openingBalanceDate }
    const row = { index: i, action, errors: errs, warnings: warns, normalized }
    if (errs.length > 0) { errorsCount++ }
    else { if (action === 'create') creates++; else if (action === 'update') updates++; }
    out.push(row)
  }

  return NextResponse.json({ summary: { creates, updates, errors: errorsCount, total: body.rows.length }, rows: out })
}
