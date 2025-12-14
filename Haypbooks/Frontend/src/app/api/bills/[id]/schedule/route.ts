import { NextResponse } from 'next/server'
import { getRoleFromCookies, hasPermission } from '@/lib/rbac-server'
import { db, findBill as dbFindBill, updateBill as dbUpdateBill } from '@/mock/db'

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const { id } = params
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 })
  const role = getRoleFromCookies()
  if (!hasPermission(role, 'bills:write')) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  const body = await req.json().catch(() => ({} as any))
  const date = typeof body?.date === 'string' ? body.date : null
  if (!date) return NextResponse.json({ error: 'date is required (ISO string)' }, { status: 400 })
  const bill = dbFindBill(id)
  if (!bill) return NextResponse.json({ error: 'Bill not found' }, { status: 404 })
  if (bill.status === 'paid') return NextResponse.json({ error: 'Bill already paid' }, { status: 400 })
  const updated = dbUpdateBill(id, { scheduledDate: date, status: 'scheduled' as any })
  const mapped = { ...updated, vendor: db.vendors.find(v => v.id === updated.vendorId)?.name || updated.vendorId }
  return NextResponse.json({ bill: mapped })
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const { id } = params
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 })
  const role = getRoleFromCookies()
  if (!hasPermission(role, 'bills:write')) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  const bill = dbFindBill(id)
  if (!bill) return NextResponse.json({ error: 'Bill not found' }, { status: 404 })
  if (bill.status === 'paid') return NextResponse.json({ error: 'Bill already paid' }, { status: 400 })
  const updated = dbUpdateBill(id, { scheduledDate: null, status: bill.balance === 0 ? 'paid' as any : 'open' as any })
  const mapped = { ...updated, vendor: db.vendors.find(v => v.id === updated.vendorId)?.name || updated.vendorId }
  return NextResponse.json({ bill: mapped })
}
