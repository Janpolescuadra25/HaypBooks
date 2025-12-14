import { NextResponse } from 'next/server'
import { getRoleFromCookies, hasPermission } from '@/lib/rbac-server'
import { db, findBill as dbFindBill, applyPaymentToBill as dbApplyPaymentToBill } from '@/mock/db'
import { nextCheckNumber, upsertCheck } from '@/app/api/checks/store'
import { isDateInClosedPeriod, buildClosedPeriodErrorPayload } from '@/lib/period-lock'

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const { id } = params
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 })
  const role = getRoleFromCookies()
  if (!hasPermission(role, 'bills:write')) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  const body = await req.json().catch(() => ({} as any))
  const amount = Number(body?.amount)
  if (!Number.isFinite(amount) || amount <= 0) return NextResponse.json({ error: 'amount must be > 0' }, { status: 400 })
  const date = typeof body?.date === 'string' && /\d{4}-\d{2}-\d{2}/.test(body.date) ? body.date : undefined
  const method = typeof body?.method === 'string' ? body.method : undefined
  const reference = typeof body?.reference === 'string' ? body.reference : undefined
  const accountNumber = typeof body?.accountNumber === 'string' ? body.accountNumber : undefined
  const printLater = body?.printLater === true
  const checkAccount = typeof body?.checkAccount === 'string' ? body.checkAccount : undefined
  const bill = dbFindBill(id)
  if (!bill) return NextResponse.json({ error: 'Bill not found' }, { status: 404 })
  // Proactive closed-period check using provided date or today
  const requestedDate = (date || new Date().toISOString().slice(0,10))
  const cp = isDateInClosedPeriod(requestedDate)
  if (cp) return NextResponse.json(buildClosedPeriodErrorPayload(cp.closedThrough, cp.requestedDate), { status: 400 })
  try {
    const { bill: updated, payment } = dbApplyPaymentToBill(id, amount, { date })
    // Attach metadata to the newly created payment (mock layer extension)
    // payment date is already set via db layer when provided
    if (method) (payment as any).method = method
    if (reference) (payment as any).reference = reference
    if (accountNumber) (payment as any).accountNumber = accountNumber

    // If paying by check and opting to print later, create a Check queued for printing
    if (method === 'check' && printLater && checkAccount) {
      const payee = db.vendors.find(v => v.id === updated.vendorId)?.name || updated.vendorId
      const number = nextCheckNumber(checkAccount)
      const chk = upsertCheck({
        id: `chk_${Math.random().toString(36).slice(2, 10)}`,
        date: (payment.date || new Date().toISOString()).slice(0, 10),
        payee,
        amount: Number(amount),
        account: checkAccount,
        number,
        status: 'to_print',
        memo: reference || undefined,
      })
      ;(db.auditEvents ||= []).push({
        id: `aud_${Date.now()}`,
        ts: new Date().toISOString(),
        actor: 'system',
        action: 'check:create',
        entityType: 'check',
        entityId: chk.id,
        after: { ...chk },
        meta: { source: 'billPayment', billId: updated.id, account: chk.account, number: chk.number, amount: chk.amount }
      } as any)
    }
    const mapped = { ...updated, vendor: db.vendors.find(v => v.id === updated.vendorId)?.name || updated.vendorId }
    return NextResponse.json({ bill: mapped, payment })
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
