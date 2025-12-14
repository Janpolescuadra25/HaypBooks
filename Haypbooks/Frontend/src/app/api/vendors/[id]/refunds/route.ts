import { NextResponse } from 'next/server'
import { getRoleFromCookies, hasPermission } from '@/lib/rbac-server'
import { db, seedIfNeeded, listVendorRefunds, createVendorRefund } from '@/mock/db'
import { isDateInClosedPeriod, buildClosedPeriodErrorPayload } from '@/lib/period-lock'

export async function GET(_req: Request, ctx: { params: { id: string } }) {
  if (!db.seeded) { try { seedIfNeeded() } catch {} }
  const role = getRoleFromCookies()
  if (!hasPermission(role, 'reports:read') && !hasPermission(role, 'bills:read')) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }
  const id = ctx.params.id
  const rows = listVendorRefunds({ vendorId: id })
  return NextResponse.json({ refunds: rows })
}

export async function POST(req: Request, ctx: { params: { id: string } }) {
  if (!db.seeded) { try { seedIfNeeded() } catch {} }
  const role = getRoleFromCookies()
  if (!hasPermission(role, 'bills:write')) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  const id = ctx.params.id
  const body = await req.json().catch(() => ({} as any))
  const amount = Number(body?.amount)
  const date = typeof body?.date === 'string' ? body.date : undefined
  const method = body?.method ? String(body.method) : undefined
  const reference = body?.reference ? String(body.reference) : undefined
  const vendorCreditId = body?.vendorCreditId ? String(body.vendorCreditId) : undefined
  if (!(amount > 0)) return NextResponse.json({ error: 'Amount must be > 0' }, { status: 400 })
  // Closed-period enforcement with structured payload
  const requestedDate = (date || new Date().toISOString().slice(0,10))
  const cp = isDateInClosedPeriod(requestedDate)
  if (cp) return NextResponse.json(buildClosedPeriodErrorPayload(cp.closedThrough, cp.requestedDate), { status: 400 })
  try {
    const refund = createVendorRefund({ vendorId: id, amount, date, method, reference, vendorCreditId })
    return NextResponse.json({ refund })
  } catch (e: any) {
    const msg = String(e?.message || 'Bad Request')
    if (/closed period/i.test(msg)) {
      const cp2 = isDateInClosedPeriod(requestedDate)
      if (cp2) return NextResponse.json(buildClosedPeriodErrorPayload(cp2.closedThrough, cp2.requestedDate), { status: 400 })
      return NextResponse.json({ error: 'Bad Request' }, { status: 400 })
    }
    const status = /not found|mismatch|exceeds/i.test(msg) ? 400 : 400
    return NextResponse.json({ error: msg }, { status })
  }
}
