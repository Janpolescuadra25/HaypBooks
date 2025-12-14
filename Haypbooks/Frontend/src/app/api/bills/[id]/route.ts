import { NextResponse } from 'next/server'
import { getRoleFromCookies, hasPermission } from '@/lib/rbac-server'
import { db, seedIfNeeded, findBill as dbFindBill, updateBill as dbUpdateBill, applyPaymentToBill as dbApplyPaymentToBill, deleteBillWithAudit as dbDeleteBillWithAudit } from '@/mock/db'
import { getClosedThrough } from '@/lib/periods'
import { buildClosedPeriodErrorPayload } from '@/lib/period-lock'

function mapBillResponse(bill: any) {
  return {
    ...bill,
    vendor: db.vendors.find(v => v.id === bill.vendorId)?.name || bill.vendorId,
    // Expose items for UI table compatibility (derived from lines if present)
    items: Array.isArray((bill as any).lines)
      ? (bill as any).lines.map((l: any) => ({ description: l.description, amount: l.amount }))
      : (bill as any).items,
  }
}

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  if (!db.seeded) { try { seedIfNeeded() } catch {} }
  const { id } = params
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 })
  const bill = dbFindBill(id)
  if (!bill) return NextResponse.json({ error: 'Not Found' }, { status: 404 })
  return NextResponse.json({ bill: mapBillResponse(bill) })
}

export async function POST(_req: Request, { params }: { params: { id: string } }) {
  if (!db.seeded) { try { seedIfNeeded() } catch {} }
  const { id } = params
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 })
  const role = getRoleFromCookies()
  if (!hasPermission(role, 'bills:write')) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  const bill = dbFindBill(id)
  if (!bill) return NextResponse.json({ error: 'Not Found' }, { status: 404 })
  const remaining = Math.max(0, Number(bill.total || 0) - (bill.payments || []).reduce((s, p) => s + Number(p.amount || 0), 0))
  const { bill: updated, payment } = dbApplyPaymentToBill(id, remaining)
  return NextResponse.json({ bill: mapBillResponse(updated), payment })
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  if (!db.seeded) { try { seedIfNeeded() } catch {} }
  const { id } = params
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 })
  const role = getRoleFromCookies()
  if (!hasPermission(role, 'bills:write')) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  const body = await req.json().catch(() => ({} as any))
  const vendorId = body.vendorId || body.vendor
  const lines = Array.isArray(body.lines) ? body.lines : (Array.isArray(body.items) ? body.items : undefined)
  // Period lock: prevent moving bill into a closed period
  const closed = getClosedThrough()
  if (closed && body?.billDate) {
    const billDateStr: string = String(body.billDate).slice(0,10)
    const d = new Date(billDateStr + 'T00:00:00Z')
    const c = new Date(closed + 'T00:00:00Z')
    if (!isNaN(d.valueOf()) && !isNaN(c.valueOf()) && d.getTime() <= c.getTime()) {
      return NextResponse.json(buildClosedPeriodErrorPayload(closed, billDateStr), { status: 400 })
    }
  }
  try {
    const bill = dbUpdateBill(id, { number: body.number, vendorId, billDate: body.billDate, terms: body.terms, dueDate: body.dueDate, status: body.status, lines })
    return NextResponse.json({ bill: mapBillResponse(bill) })
  } catch (e: any) {
    const msg = typeof e?.message === 'string' ? e.message : ''
    if (msg === 'Bill not found') return NextResponse.json({ error: 'Not Found' }, { status: 404 })
    // Map closed-period and other business validation errors to 400
    return NextResponse.json({ error: msg || 'Bad Request' }, { status: 400 })
  }
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  if (!db.seeded) { try { seedIfNeeded() } catch {} }
  const { id } = params
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 })
  const role = getRoleFromCookies()
  if (!hasPermission(role, 'bills:write')) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  const ok = dbDeleteBillWithAudit(id)
  if (!ok) return NextResponse.json({ error: 'Not Found' }, { status: 404 })
  return NextResponse.json({ ok: true })
}
