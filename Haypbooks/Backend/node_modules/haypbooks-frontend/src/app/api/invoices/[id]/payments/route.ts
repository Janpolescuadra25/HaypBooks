import { NextResponse } from 'next/server'
import { getRoleFromCookies, hasPermission } from '@/lib/rbac-server'
import { db, applyPaymentToInvoice as dbApplyPaymentToInvoice } from '@/mock/db'
import { isDateInClosedPeriod, buildClosedPeriodErrorPayload } from '@/lib/period-lock'

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const { id } = params
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 })

  const role = getRoleFromCookies()
  if (!hasPermission(role, 'invoices:write')) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const body = await req.json().catch(() => ({} as any))
  const amount = Number(body?.amount)
  if (!Number.isFinite(amount) || amount <= 0) return NextResponse.json({ error: 'amount must be > 0' }, { status: 400 })
  const date = typeof body?.date === 'string' && /\d{4}-\d{2}-\d{2}/.test(body.date) ? body.date : undefined

  // Proactive closed-period check
  const requestedDate = (date || new Date().toISOString().slice(0,10))
  const cp = isDateInClosedPeriod(requestedDate)
  if (cp) return NextResponse.json(buildClosedPeriodErrorPayload(cp.closedThrough, cp.requestedDate), { status: 400 })

  try {
    const { invoice: inv, payment } = dbApplyPaymentToInvoice(id, amount, { date })
    const invoice = { ...inv, customer: db.customers.find(c => c.id === inv.customerId)?.name || inv.customerId }
    return NextResponse.json({ invoice, payment })
  } catch (e: any) {
    const raw = String(e?.message || '')
    if (/not found/i.test(raw)) return NextResponse.json({ error: 'Not Found' }, { status: 404 })
    if (/exceeds/i.test(raw)) return NextResponse.json({ error: 'Payment exceeds remaining balance' }, { status: 400 })
    if (/closed period/i.test(raw)) {
      const cp2 = isDateInClosedPeriod(requestedDate)
      if (cp2) return NextResponse.json(buildClosedPeriodErrorPayload(cp2.closedThrough, cp2.requestedDate), { status: 400 })
      return NextResponse.json({ error: 'Bad Request' }, { status: 400 })
    }
    return NextResponse.json({ error: 'Bad Request' }, { status: 400 })
  }
}
