import { NextResponse } from 'next/server'
import { getRoleFromCookies, hasPermission } from '@/lib/rbac-server'
import { seedIfNeeded, closePurchaseOrder } from '@/mock/db'

export async function POST(_req: Request, { params }: { params: { id: string } }) {
  const role = getRoleFromCookies()
  if (!hasPermission(role, 'bills:write')) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  seedIfNeeded()
  try {
    const po = closePurchaseOrder(params.id)
    return NextResponse.json({ purchaseOrder: po })
  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'Error' }, { status: 400 })
  }
}
