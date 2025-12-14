import { NextResponse } from 'next/server'
import { getRoleFromCookies, hasPermission } from '@/lib/rbac-server'
import { voidBill, findBill, db } from '@/mock/db'

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const role = getRoleFromCookies()
  if (!hasPermission(role, 'bills:write')) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  const body = await req.json().catch(()=> ({}))
  const { createReversing, reason, reversalDate } = body || {}
  const bill = findBill(params.id)
  if (!bill) return NextResponse.json({ error: 'Not Found' }, { status: 404 })
  try {
    voidBill(bill.id, { createReversing, reason, reversalDate })
    const audit = (db.auditEvents || []).filter(e => e.entityType === 'bill' && e.entityId === bill.id).slice(-5)
    return NextResponse.json({ bill, audit })
  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'Error' }, { status: 400 })
  }
}
