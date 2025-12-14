import { NextResponse } from 'next/server'
import { getRoleFromCookies, hasPermission } from '@/lib/rbac-server'
import { db, seedIfNeeded } from '@/mock/db'
import '@/mock/seed'

export async function GET(_req: Request) {
  seedIfNeeded()
  const role = getRoleFromCookies()
  if (!hasPermission(role, 'reports:read')) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  const asOfIso = new Date().toISOString().slice(0,10)
  const closedThrough = db.settings?.closeDate || null
  const columns = ['Setting', 'Value']
  const rows = [['Closed through', closedThrough || '—']]
  return NextResponse.json({ period: 'AsOf', start: null, end: null, asOf: asOfIso, columns, rows })
}
