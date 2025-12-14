import { NextResponse } from 'next/server'
import { getRoleFromCookies, hasPermission } from '@/lib/rbac-server'
import { db, findBill as dbFindBill, billApprovalAction as dbBillApprovalAction } from '@/mock/db'

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const { id } = params
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 })
  const body = await req.json().catch(() => ({} as any))
  const action = String(body?.action || '')
  const role = getRoleFromCookies()
  const bill = dbFindBill(id)
  if (!bill) return NextResponse.json({ error: 'Bill not found' }, { status: 404 })

  if (action === 'submit') {
    if (!hasPermission(role, 'bills:write')) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    const updated = dbBillApprovalAction(id, 'submit')
    const mapped = { ...updated, vendor: db.vendors.find(v => v.id === updated.vendorId)?.name || updated.vendorId }
    return NextResponse.json({ bill: mapped })
  }

  if (action === 'approve') {
    if (!hasPermission(role, 'bills:approve')) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    const updated = dbBillApprovalAction(id, 'approve')
    const mapped = { ...updated, vendor: db.vendors.find(v => v.id === updated.vendorId)?.name || updated.vendorId }
    return NextResponse.json({ bill: mapped })
  }

  if (action === 'reject') {
    if (!hasPermission(role, 'bills:approve')) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    const updated = dbBillApprovalAction(id, 'reject', String(body?.note || ''))
    const mapped = { ...updated, vendor: db.vendors.find(v => v.id === updated.vendorId)?.name || updated.vendorId }
    return NextResponse.json({ bill: mapped })
  }

  return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
}
