import { NextResponse } from 'next/server'
import { getRoleFromCookies, hasPermission } from '@/lib/rbac-server'
import { db } from '@/mock/db'

export async function GET(req: Request) {
  const role = getRoleFromCookies()
  if (!hasPermission(role, 'reports:read')) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  const url = new URL(req.url)
  const q = (url.searchParams.get('q') || '').toLowerCase()
  const methods: string[] = (db as any).paymentMethods || ['Card', 'ACH']
  let rows = methods.map((m: string) => ({ method: m }))
  if (q) rows = rows.filter((r: { method: string }) => r.method.toLowerCase().includes(q))
  return NextResponse.json({ rows })
}
