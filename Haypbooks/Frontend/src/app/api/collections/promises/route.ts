import { NextResponse } from 'next/server'
import { getRoleFromCookies, hasPermission } from '@/lib/rbac-server'
import { db } from '@/mock/db'
import { PromiseToPay } from '../../../../types/domain'
import { logEvent } from '@/lib/audit'
import { evaluatePromises } from '@/lib/promise-eval'

// Basic in-memory promises collection API
// POST /api/collections/promises  body: { customerId, invoiceIds?: string[], amount, promisedDate, note? }
// GET  /api/collections/promises?customerId=  (list)

export async function GET(req: Request) {
  const role = getRoleFromCookies()
  if (!hasPermission(role, 'invoices:read')) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  const url = new URL(req.url)
  const customerId = url.searchParams.get('customerId') || undefined
  // Evaluate statuses before returning
  evaluatePromises()
  const list = (db.promises || []).filter(p => !customerId || p.customerId === customerId)
  return NextResponse.json({ promises: list })
}

export async function POST(req: Request) {
  const role = getRoleFromCookies()
  if (!hasPermission(role, 'invoices:write')) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  const body = await req.json().catch(()=>({})) as any
  const customerId = String(body?.customerId || '')
  const amount = Number(body?.amount)
  const promisedDate = String(body?.promisedDate || '')
  const invoiceIds: string[] = Array.isArray(body?.invoiceIds) ? body.invoiceIds.map((v: any)=> String(v)) : []
  if (!customerId || !(amount > 0) || !promisedDate) return NextResponse.json({ error: 'customerId, amount > 0, promisedDate required' }, { status: 400 })
  if (!db.customers.find(c => c.id === customerId)) return NextResponse.json({ error: 'Customer not found' }, { status: 404 })
  const todayIso = new Date().toISOString().slice(0,10)
  // Allow promises for today or future; if past date treat as broken immediately
  const status: PromiseToPay['status'] = promisedDate < todayIso ? 'broken' : 'open'
  const promise: PromiseToPay = {
    id: `ptp_${Math.random().toString(36).slice(2,8)}`,
    customerId,
    invoiceIds,
    amount: Number(amount.toFixed(2)),
    promisedDate,
    status,
    createdAt: new Date().toISOString(),
    note: body?.note ? String(body.note) : undefined,
  }
  ;(db.promises ||= []).push(promise)
  logEvent({ userId: 'u_mock', action: 'promise:create', entity: 'promise', entityId: promise.id, meta: { customerId, amount: promise.amount, promisedDate } })
  return NextResponse.json({ promise })
}

// Manual status mutation endpoints (simple POST with no body besides path)
// Note: Non-standard method exports (e.g., POST_KEEP) are not supported by Next.js route handlers.
// Use dedicated sub-path routes under /api/collections/promises/[id]/keep and /broken instead.

