import { NextResponse } from 'next/server'
import { getRoleFromCookies, hasPermission } from '@/lib/rbac-server'
import { seedIfNeeded } from '@/mock/db'
import { computeCustomerStatement } from '@/mock/aggregations'

export async function GET(req: Request, ctx: { params: { id: string } }) {
  const role = getRoleFromCookies()
  if (!hasPermission(role, 'reports:read')) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  seedIfNeeded()
  const url = new URL(req.url)
  const id = ctx.params.id
  const asOfIso = (url.searchParams.get('asOf') || url.searchParams.get('end') || new Date().toISOString().slice(0,10))
  const asOf = new Date(asOfIso)
  const startParam = url.searchParams.get('start')
  const typeParam = url.searchParams.get('type') as any
  const start = startParam ? new Date(startParam + 'T00:00:00Z') : null
  const type = (typeParam === 'balance-forward' || typeParam === 'transaction' || typeParam === 'open-item') ? typeParam : undefined
  const statement = computeCustomerStatement(id, asOf, { start, type })
  return NextResponse.json({ statement })
}
