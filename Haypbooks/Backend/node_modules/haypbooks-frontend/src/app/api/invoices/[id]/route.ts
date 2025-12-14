import { NextResponse } from 'next/server'
import { getRoleFromCookies, hasPermission } from '@/lib/rbac-server'
import { db, seedIfNeeded, findInvoice as dbFindInvoice, updateInvoice as dbUpdateInvoice, deleteInvoice as dbDeleteInvoice } from '@/mock/db'
import { getClosedThrough } from '@/lib/periods'
import { buildClosedPeriodErrorPayload } from '@/lib/period-lock'

function mapInvoiceResponse(inv: any) {
  return {
    ...inv,
    customer: db.customers.find(c => c.id === inv.customerId)?.name || inv.customerId,
    // Expose items for UI table compatibility (derived from lines if present)
    items: Array.isArray((inv as any).lines)
      ? (inv as any).lines.map((l: any) => ({ description: l.description, amount: l.amount }))
      : (inv as any).items,
  }
}

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  if (!db.seeded) { try { seedIfNeeded() } catch {} }
  const { id } = params
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 })
  const inv = dbFindInvoice(id)
  if (!inv) return NextResponse.json({ error: 'Not Found' }, { status: 404 })
  return NextResponse.json({ invoice: mapInvoiceResponse(inv) })
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  if (!db.seeded) { try { seedIfNeeded() } catch {} }
  const { id } = params
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 })
  const role = getRoleFromCookies()
  if (!hasPermission(role, 'invoices:write')) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  const body = await req.json().catch(() => ({} as any))
  const lines = Array.isArray(body.lines) ? body.lines : (Array.isArray(body.items) ? body.items : undefined)
  let customerId = body.customerId
  if (!customerId && body.customer) {
    const found = db.customers.find(c => c.name === body.customer)
    if (found) customerId = found.id
  }
  // Period lock: prevent moving invoice into a closed period
  const closed = getClosedThrough()
  if (closed && body?.date) {
    const invDateStr: string = String(body.date).slice(0,10)
    const d = new Date(invDateStr + 'T00:00:00Z')
    const c = new Date(closed + 'T00:00:00Z')
    if (!isNaN(d.valueOf()) && !isNaN(c.valueOf()) && d.getTime() <= c.getTime()) {
      return NextResponse.json(buildClosedPeriodErrorPayload(closed, invDateStr), { status: 400 })
    }
  }
  try {
    const inv = dbUpdateInvoice(id, { number: body.number, customerId, status: body.status, date: body.date, lines })
    return NextResponse.json({ invoice: mapInvoiceResponse(inv) })
  } catch (e: any) {
    return NextResponse.json({ error: 'Not Found' }, { status: 404 })
  }
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  if (!db.seeded) { try { seedIfNeeded() } catch {} }
  const { id } = params
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 })
  const role = getRoleFromCookies()
  if (!hasPermission(role, 'invoices:write')) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  const ok = dbDeleteInvoice(id)
  if (!ok) return NextResponse.json({ error: 'Not Found' }, { status: 404 })
  return NextResponse.json({ ok: true })
}
