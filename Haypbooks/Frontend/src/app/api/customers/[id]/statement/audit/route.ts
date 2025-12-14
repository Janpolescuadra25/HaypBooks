import { NextResponse } from 'next/server'
import { getRoleFromCookies, hasPermission } from '@/lib/rbac-server'
import { db, seedIfNeeded } from '@/mock/db'

export async function GET(req: Request, ctx: { params: { id: string } }) {
  const role = getRoleFromCookies()
  if (!hasPermission(role, 'audit:read')) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  seedIfNeeded()
  const id = ctx.params.id
  const events = (db.auditEvents || []).filter((e: any) => e?.action === 'statement:send' && e?.entityId === id)
    .sort((a: any,b: any) => (b.ts || '').localeCompare(a.ts || ''))
    .slice(0, 50)
  return NextResponse.json({ events })
}
