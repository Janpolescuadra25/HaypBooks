import { NextResponse } from 'next/server'
import { getRoleFromCookies, hasPermission } from '@/lib/rbac-server'
import { ensureSampleItems, listItems } from '../../items/store'

export async function GET(req: Request) {
  const role = getRoleFromCookies()
  if (!hasPermission(role, 'reports:read')) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  const url = new URL(req.url)
  const q = (url.searchParams.get('q') || '').toLowerCase()
  ensureSampleItems()
  let rows = listItems().map((i) => ({ name: i.name, type: i.type }))
  if (q) rows = rows.filter((r) => r.name.toLowerCase().includes(q))
  return NextResponse.json({ rows })
}
