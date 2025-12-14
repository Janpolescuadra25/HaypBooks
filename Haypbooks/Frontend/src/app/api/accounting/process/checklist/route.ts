import { NextResponse } from 'next/server'
import { db, seedIfNeeded } from '@/mock/db'
import { getRoleFromCookies, hasPermission } from '@/lib/rbac-server'

function nowIso() { return new Date().toISOString().slice(0,10) }
function ym(dIso?: string) { return (dIso || nowIso()).slice(0,7) }

export type ChecklistItem = {
  id: string
  label: string
  done: boolean
  note?: string
}

const DEFAULT_ITEMS: ChecklistItem[] = [
  { id: 'reconcile', label: 'Reconcile bank accounts', done: false },
  { id: 'undeposited', label: 'Clear undeposited funds', done: false },
  { id: 'ar-review', label: 'Review receivables and apply credits', done: false },
  { id: 'ap-review', label: 'Review payables and vendor credits', done: false },
  { id: 'write-offs', label: 'Apply write-offs (if any)', done: false },
  { id: 'finance-charges', label: 'Assess finance charges (if any)', done: false },
  { id: 'statements', label: 'Send statements (if needed)', done: false },
  { id: 'recurring-adj', label: 'Post recurring adjustments (depreciation, amortization)', done: false },
  { id: 'inventory-adj', label: 'Post inventory adjustments (if applicable)', done: false },
  { id: 'closing-entries', label: 'Generate closing entries', done: false },
  { id: 'close-books', label: 'Close books for the month', done: false },
]

function getStore() {
  ;(db as any).settings = (db as any).settings || {}
  const s = (db as any).settings
  s.monthEndChecklist = s.monthEndChecklist || {}
  return s.monthEndChecklist as Record<string, ChecklistItem[]>
}

export async function GET(req: Request) {
  try { seedIfNeeded() } catch {}
  const role = getRoleFromCookies()
  if (!hasPermission(role, 'reports:read')) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  const url = new URL(req.url)
  const period = url.searchParams.get('period') || ym()
  const store = getStore()
  if (!Array.isArray(store[period]) || store[period].length === 0) {
    store[period] = DEFAULT_ITEMS.map(i => ({ ...i }))
  }
  return NextResponse.json({ period, items: store[period] })
}

export async function POST(req: Request) {
  try { seedIfNeeded() } catch {}
  const role = getRoleFromCookies()
  if (!hasPermission(role, 'settings:write')) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  const body = await req.json().catch(()=>null) as { period?: string; id?: string; done?: boolean; action?: 'reset' }
  const period = body?.period || ym()
  const store = getStore()
  if (body?.action === 'reset') {
    store[period] = DEFAULT_ITEMS.map(i => ({ ...i }))
    return NextResponse.json({ period, items: store[period] })
  }
  if (!Array.isArray(store[period]) || store[period].length === 0) {
    store[period] = DEFAULT_ITEMS.map(i => ({ ...i }))
  }
  const id = body?.id
  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 })
  const idx = store[period].findIndex(i => i.id === id)
  if (idx === -1) return NextResponse.json({ error: 'item not found' }, { status: 404 })
  store[period][idx] = { ...store[period][idx], done: !!body?.done }
  return NextResponse.json({ period, items: store[period] })
}
