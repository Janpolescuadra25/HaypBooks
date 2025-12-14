import { NextResponse } from 'next/server'
import { getRoleFromCookies, hasPermission } from '@/lib/rbac-server'
import { listTerms } from '../../terms/store'

export async function GET(req: Request) {
  const role = getRoleFromCookies()
  if (!hasPermission(role, 'reports:read')) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  const url = new URL(req.url)
  const q = (url.searchParams.get('q') || '').toLowerCase()
  let rows = listTerms().map((t) => ({ term: t }))
  if (q) rows = rows.filter((r) => r.term.toLowerCase().includes(q))
  return NextResponse.json({ rows })
}
