import { NextResponse } from 'next/server'
import { getRoleFromCookies, hasPermission } from '@/lib/rbac-server'
import { seedIfNeeded, findPurchaseOrder, db } from '@/mock/db'

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const role = getRoleFromCookies()
  if (!hasPermission(role, 'bills:read')) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  seedIfNeeded()
  try {
    const po = findPurchaseOrder(params.id)
    if (!po) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    const vendor = db.vendors.find(v => v.id === po.vendorId)?.name || po.vendorId
    return NextResponse.json({ purchaseOrder: { ...po, vendor } })
  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'Error' }, { status: 400 })
  }
}
