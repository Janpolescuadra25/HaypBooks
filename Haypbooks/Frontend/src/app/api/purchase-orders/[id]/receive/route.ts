import { NextResponse } from 'next/server'
import { getRoleFromCookies, hasPermission } from '@/lib/rbac-server'
import { seedIfNeeded, receivePurchaseOrder } from '@/mock/db'

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const role = getRoleFromCookies()
  if (!hasPermission(role, 'bills:write')) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  seedIfNeeded()
  const body = await req.json().catch(() => ({}))
  const { billNumber, billDate, terms } = body || {}
  try {
    const result = receivePurchaseOrder(params.id, { billNumber, billDate, terms })
    return NextResponse.json(result)
  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'Error' }, { status: 400 })
  }
}
