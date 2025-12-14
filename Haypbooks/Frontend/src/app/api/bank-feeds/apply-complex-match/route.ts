import { NextResponse } from 'next/server'
import { getRoleFromCookies, hasPermission } from '@/lib/rbac-server'
import { applyComplexMatchAcrossArAp } from '@/mock/db'

export async function POST(req: Request) {
  const role = getRoleFromCookies()
  if (!hasPermission(role, 'journal:write')) return new NextResponse('Forbidden', { status: 403 })
  let body: any = null
  try { body = await req.json() } catch { return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 }) }
  const { txnId, invoices, bills, manualAdjustment, date } = body || {}
  if (!txnId) return NextResponse.json({ error: 'txnId required' }, { status: 400 })
  if ((!Array.isArray(invoices) || invoices.length === 0) && (!Array.isArray(bills) || bills.length === 0)) {
    return NextResponse.json({ error: 'Provide at least one invoice or bill selection' }, { status: 400 })
  }
  // Best-practice guard: do not net A/R and A/P within a single bank feed match.
  // If both invoices and bills are provided together, require a dedicated clearing account workflow (not supported here).
  if (Array.isArray(invoices) && invoices.length > 0 && Array.isArray(bills) && bills.length > 0) {
    return NextResponse.json({
      error: 'Mixing receivables and payables in one bank transaction is not allowed here. Match deposits to invoices, withdrawals to bills. To net AR and AP, use a clearing-account workflow.'
    }, { status: 400 })
  }
  try {
    const result = applyComplexMatchAcrossArAp({ txnId, invoices, bills, manualAdjustment, date })
    return NextResponse.json({ ok: true, result })
  } catch (e: any) {
    const msg = e?.message || 'Failed to apply complex match'
    const status = /not found|exceeds|eligible|Zero amount|No selections/i.test(msg) ? 400 : 400
    return NextResponse.json({ error: msg }, { status })
  }
}
