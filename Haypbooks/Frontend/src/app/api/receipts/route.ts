import { NextRequest, NextResponse } from 'next/server'
import { getRoleFromCookies, hasPermission } from '@/lib/rbac-server'
import { db, seedIfNeeded } from '@/mock/db'
import { listReceipts, addReceipt, findReceipt, deleteReceipt, type Receipt as StoredReceipt } from './store'
import { logEvent } from '@/lib/audit'

// Local Receipt type (not exported) to avoid non-handler exports triggering Next route typing constraints.
type Receipt = StoredReceipt & {
  id: string
  date: string
  vendor: string
  amount: number
  currency?: string
// Receipt type and store now live in store.ts to keep route exports minimal.
  matchedTransactionId?: string
  attachment?: { name: string; size: number }
  createdBy?: string
  createdAt?: string
}


export async function GET(req: NextRequest) {
  try { seedIfNeeded() } catch {}
  const role = getRoleFromCookies()
  // Align with other list JSON routes like deposits: require reports:read to view
  if (!hasPermission(role, 'reports:read')) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  const receiptRows = (listReceipts() || [])
  const url = new URL(req.url)
  const start = url.searchParams.get('start') || undefined
  const end = url.searchParams.get('end') || undefined
  const vendor = (url.searchParams.get('vendor') || '').toLowerCase()
  const status = (url.searchParams.get('status') || '').toLowerCase() as any
  const matched = url.searchParams.get('matched')
  const q = (url.searchParams.get('q') || '').toLowerCase()

  const filtered = receiptRows
    .filter(r => !start || (r.date || '').slice(0,10) >= start)
    .filter(r => !end || (r.date || '').slice(0,10) <= end)
    .filter(r => !vendor || (r.vendor || '').toLowerCase().includes(vendor))
    .filter(r => !status || (r.status || 'uploaded').toLowerCase() === status)
    .filter(r => matched == null || matched === '' ? true : (matched === 'true' ? !!r.matchedTransactionId : !r.matchedTransactionId))
    .filter(r => !q || (r.vendor?.toLowerCase().includes(q) || r.attachment?.name?.toLowerCase().includes(q)))
    .map(r => ({ ...r, currency: r.currency || (db.settings?.baseCurrency as string) || 'USD' }))

  return NextResponse.json({ receipts: filtered })
}

export async function POST(req: NextRequest) {
  try { seedIfNeeded() } catch {}
  const role = getRoleFromCookies()
  if (!hasPermission(role, 'journal:write')) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  const body = await req.json().catch(() => null)
  if (!body) return NextResponse.json({ error: 'Bad request' }, { status: 400 })
  // Duplicate guard: prevent repeat uploads of identical attachment (name + size) while keeping idempotence explicit.
  try {
    if (body?.attachment?.name && typeof body?.attachment?.size === 'number') {
      const existing = (listReceipts() || []).find(r => r.attachment && r.attachment.name === body.attachment.name && r.attachment.size === body.attachment.size)
      if (existing) {
        return NextResponse.json({ error: 'Duplicate receipt detected', duplicateOf: existing.id }, { status: 409 })
      }
    }
  } catch { /* non-fatal */ }
  const id = Math.random().toString(36).slice(2)
  const now = new Date().toISOString()
  const r: Receipt = {
    id,
    date: String(body.date || now.slice(0,10)),
    vendor: String(body.vendor || 'Vendor'),
    amount: Number(body.amount || 0),
    currency: String(body.currency || (db.settings?.baseCurrency as string) || 'USD'),
    method: (body.method || 'upload'),
    status: (body.status || 'uploaded'),
    matchedTransactionId: body.matchedTransactionId || undefined,
    attachment: body.attachment,
    createdBy: role || 'system',
    createdAt: now,
    expenseAccountNumber: body.expenseAccountNumber || '6000',
  }
  addReceipt(r)
  try { logEvent({ userId: role || 'system', action: 'receipt.create', entity: 'receipt', entityId: id, meta: { method: r.method, vendor: r.vendor, amount: r.amount } }) } catch {}
  return NextResponse.json({ receipt: r }, { status: 201 })
}

export async function DELETE(req: NextRequest) {
  const role = getRoleFromCookies()
  if (!hasPermission(role, 'journal:write')) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  const { searchParams } = new URL(req.url)
  const id = searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 })
  const existing = findReceipt(id)
  if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  if (existing.status === 'posted') return NextResponse.json({ error: 'Cannot delete posted receipt' }, { status: 400 })
  deleteReceipt(id)
  return NextResponse.json({ ok: true, deletedId: id })
}

// Parse (simulate OCR extraction) — id-scoped action
// id-scoped lifecycle actions live in /api/receipts/[id]/parse and /api/receipts/[id]/match
