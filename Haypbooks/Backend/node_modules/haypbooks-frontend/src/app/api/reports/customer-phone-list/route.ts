import { NextResponse } from 'next/server'
import { getRoleFromCookies, hasPermission } from '@/lib/rbac-server'
import { db, seedIfNeeded } from '@/mock/db'

export async function GET(req: Request) {
  const role = getRoleFromCookies()
  if (!hasPermission(role, 'reports:read')) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  const url = new URL(req.url)
  const q = (url.searchParams.get('q') || '').toLowerCase()
  if (!db.seeded) { try { seedIfNeeded() } catch {} }
  let rows = (db.customers || []).map((c: any) => ({ name: c.name, phone: c.phone || '' }))
  if (q) rows = rows.filter(r => r.name.toLowerCase().includes(q))
  return NextResponse.json({ rows })
}
