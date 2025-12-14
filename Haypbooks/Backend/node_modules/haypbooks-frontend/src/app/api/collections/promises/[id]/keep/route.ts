import { NextResponse } from 'next/server'
import { db } from '@/mock/db'
import { getRoleFromCookies, hasPermission } from '@/lib/rbac-server'
import { logEvent } from '@/lib/audit'

export async function POST(_req: Request, { params }: { params: { id: string } }) {
  const role = getRoleFromCookies()
  if (!hasPermission(role, 'invoices:write')) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  const promise = (db.promises || []).find(p => p.id === params.id)
  if (!promise) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  if (promise.status === 'kept') return NextResponse.json({ promise })
  promise.status = 'kept'
  promise.keptAt = new Date().toISOString()
  logEvent({ userId: 'u_mock', action: 'promise:kept', entity: 'promise', entityId: promise.id, meta: { customerId: promise.customerId, amount: promise.amount } })
  return NextResponse.json({ promise })
}
