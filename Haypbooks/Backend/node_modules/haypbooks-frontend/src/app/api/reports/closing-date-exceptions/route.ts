import { NextResponse } from 'next/server'
import { db, seedIfNeeded } from '@/mock/db'
import { getRoleFromCookies, hasPermission } from '@/lib/rbac-server'
import { getClosedThrough } from '@/lib/periods'

function dateOnly(isoTs?: string | null): string | null {
  if (!isoTs) return null
  try { return new Date(isoTs).toISOString().slice(0,10) } catch { return (isoTs as string).slice(0,10) }
}

function isOnOrBefore(a?: string | null, b?: string | null): boolean {
  if (!a || !b) return false
  return a <= b
}

function changedKeys(before: any, after: any): string[] {
  const keys = new Set<string>([...Object.keys(before || {}), ...Object.keys(after || {})])
  const out: string[] = []
  for (const k of keys) {
    const bv = before ? (before as any)[k] : undefined
    const av = after ? (after as any)[k] : undefined
    const same = JSON.stringify(bv) === JSON.stringify(av)
    if (!same) out.push(k)
  }
  return out
}

function pickEntityDate(entityType?: string, entityId?: string, before?: any, after?: any): string | null {
  // Prefer explicit before/after date when available
  const bDate = dateOnly(before?.date || before?.billDate || before?.dueDate)
  const aDate = dateOnly(after?.date || after?.billDate || after?.dueDate)
  if (bDate) return bDate
  if (aDate) return aDate
  // Fallback: lookup current entity by id in db
  try {
    if (entityType === 'invoice') {
      const e = db.invoices.find(i => i.id === entityId)
      return e ? e.date.slice(0,10) : null
    }
    if (entityType === 'bill') {
      const e = db.bills.find(b => b.id === entityId)
      const d = (e?.billDate || e?.dueDate) as string | undefined
      return d ? d.slice(0,10) : null
    }
    if (entityType === 'transaction') {
      const e = db.transactions.find(t => t.id === entityId)
      return e ? e.date.slice(0,10) : null
    }
    if (entityType === 'journal') {
      const e = (db.journalEntries || []).find(j => j.id === entityId)
      return e ? e.date.slice(0,10) : null
    }
  } catch {}
  return null
}

export async function GET(req: Request) {
  try { seedIfNeeded() } catch {}
  const role = getRoleFromCookies()
  if (!hasPermission(role, 'reports:read')) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const url = new URL(req.url)
  const start = url.searchParams.get('start') || undefined
  const end = url.searchParams.get('end') || undefined
  // Boundary date defaults to closed-through; can be overridden for what-if or when books not closed
  const boundary = (url.searchParams.get('boundary') || getClosedThrough() || undefined) as string | undefined
  const limit = Math.min(Number(url.searchParams.get('limit') || '2000'), 10000)

  let events: any[] = Array.isArray((db as any).auditEvents) ? (db as any).auditEvents.slice() : []
  // Date filter on event timestamp
  if (start) { const s = new Date(start + 'T00:00:00Z').toISOString(); events = events.filter(e => String(e.ts||'') >= s) }
  if (end)   { const e = new Date(end + 'T23:59:59Z').toISOString(); events = events.filter(ev => String(ev.ts||'') <= e) }

  // Build rows of exceptions: events where entity's date is on/before boundary
  const rows: any[] = []
  const boundaryIso = boundary || null
  for (const ev of events) {
    const entType = ev.entityType || ''
    const entId = ev.entityId || ''
    const entDate = pickEntityDate(entType, entId, ev.before, ev.after)
    if (!entDate) continue
    if (boundaryIso && !isOnOrBefore(entDate, boundaryIso)) continue
    const fields = changedKeys(ev.before, ev.after)
    // Compute simple amount delta where available
    const beforeAmt = Number((ev.before?.amount ?? ev.before?.total ?? ev.before?.balance) || 0)
    const afterAmt = Number((ev.after?.amount ?? ev.after?.total ?? ev.after?.balance) || 0)
    const amountDelta = Number((afterAmt - beforeAmt).toFixed(2))
    rows.push({
      id: ev.id,
      ts: ev.ts,
      actor: ev.actor || 'system',
      action: ev.action,
      entityType: entType,
      entityId: entId,
      entityDate: entDate,
      fieldsChanged: fields,
      amountDelta,
      meta: ev.meta || undefined,
    })
    if (rows.length >= limit) break
  }
  // Sort newest first
  rows.sort((a,b)=> String(b.ts||'').localeCompare(String(a.ts||'')))

  return NextResponse.json({ boundary: boundaryIso, rows, total: rows.length })
}
