import { NextResponse } from 'next/server'
import { getRoleFromCookies, hasPermission } from '@/lib/rbac-server'
import { db, seedIfNeeded, removePaymentsFromDeposit, addPaymentsToDeposit } from '@/mock/db'
import { getDepositDetail } from '../_shared'

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  try { seedIfNeeded() } catch {}
  const role = getRoleFromCookies()
  if (!hasPermission(role, 'invoices:read') && !hasPermission(role, 'reports:read')) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }
  const id = params?.id
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 })
  const detail = getDepositDetail(id)
  if (!detail) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json({ deposit: detail })
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try { seedIfNeeded() } catch {}
  const role = getRoleFromCookies()
  if (!hasPermission(role, 'invoices:write')) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }
  const id = params?.id
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 })
  const body = await req.json().catch(() => ({} as any))
  const removePaymentIds: string[] = Array.isArray(body?.removePaymentIds) ? body.removePaymentIds : []
  const addPaymentIds: string[] = Array.isArray(body?.addPaymentIds) ? body.addPaymentIds : []
  if (!removePaymentIds.length && !addPaymentIds.length) {
    return NextResponse.json({ error: 'removePaymentIds or addPaymentIds required' }, { status: 400 })
  }
  try {
    const dep = removePaymentIds.length
      ? removePaymentsFromDeposit(id, removePaymentIds, { date: body?.date, memo: body?.memo })
      : addPaymentsToDeposit(id, addPaymentIds, { date: body?.date, memo: body?.memo })
    // Recompute detail using shared helper to ensure parity with GET/CSV
    const detail = getDepositDetail(dep.id)
    return NextResponse.json({ deposit: detail })
  } catch (e: any) {
    return NextResponse.json({ error: String(e?.message || 'Failed to edit deposit') }, { status: 400 })
  }
}
