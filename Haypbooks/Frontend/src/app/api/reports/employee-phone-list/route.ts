import { NextResponse } from 'next/server'
import { getRoleFromCookies, hasPermission } from '@/lib/rbac-server'
import { ensureSampleEmployees, listEmployees } from '../../employees/store'

export async function GET(req: Request) {
  const role = getRoleFromCookies()
  if (!hasPermission(role, 'reports:read')) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  const url = new URL(req.url)
  const q = (url.searchParams.get('q') || '').toLowerCase()
  ensureSampleEmployees()
  let rows = listEmployees().map(e => ({ name: e.name, phone: e.phone || '' }))
  if (q) rows = rows.filter(r => r.name.toLowerCase().includes(q))
  return NextResponse.json({ rows })
}
