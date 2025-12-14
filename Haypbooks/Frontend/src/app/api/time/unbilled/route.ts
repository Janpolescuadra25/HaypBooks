import { NextResponse } from 'next/server'
import { getRoleFromCookies, hasPermission } from '@/lib/rbac-server'
import { seedIfNeeded, listUnbilledTime } from '@/mock/db'

export async function GET(_: Request) {
  seedIfNeeded()
  const role = getRoleFromCookies()
  if (!hasPermission(role as any, 'invoices:read')) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  const items = listUnbilledTime({})
  return NextResponse.json({ items })
}
