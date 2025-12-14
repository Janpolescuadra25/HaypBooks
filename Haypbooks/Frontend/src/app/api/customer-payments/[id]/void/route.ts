import { NextRequest, NextResponse } from 'next/server'
import { db, seedIfNeeded, voidCustomerPayment as dbVoidCustomerPayment } from '@/mock/db'
import { getRoleFromCookies, hasPermission } from '@/lib/rbac-server'
import { isDateInClosedPeriod, buildClosedPeriodErrorPayload } from '@/lib/period-lock'

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  if (!db.seeded) { try { seedIfNeeded() } catch {} }
  const role = getRoleFromCookies()
  if (!hasPermission(role, 'invoices:write')) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  const id = params.id
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 })
  const body = await req.json().catch(() => ({} as any))
  const reversalDate = typeof body?.reversalDate === 'string' && /\d{4}-\d{2}-\d{2}/.test(body.reversalDate) ? body.reversalDate : undefined
  // Closed-period enforcement with structured payload for reversalDate (or today)
  const requestedDate = (reversalDate || new Date().toISOString().slice(0,10))
  const cp = isDateInClosedPeriod(requestedDate)
  if (cp) return NextResponse.json(buildClosedPeriodErrorPayload(cp.closedThrough, cp.requestedDate), { status: 400 })
  try {
    const cp = dbVoidCustomerPayment(id, { reversalDate })
    return NextResponse.json({ customerPayment: cp })
  } catch (e: any) {
    const raw = String(e?.message || '')
    if (/not found/i.test(raw)) return NextResponse.json({ error: 'Not Found' }, { status: 404 })
    if (/deposited/i.test(raw)) return NextResponse.json({ error: 'Cannot void a payment that has been deposited' }, { status: 400 })
    if (/closed period/i.test(raw)) {
      const cp2 = isDateInClosedPeriod(requestedDate)
      if (cp2) return NextResponse.json(buildClosedPeriodErrorPayload(cp2.closedThrough, cp2.requestedDate), { status: 400 })
      return NextResponse.json({ error: 'Bad Request' }, { status: 400 })
    }
    return NextResponse.json({ error: 'Bad Request' }, { status: 400 })
  }
}
