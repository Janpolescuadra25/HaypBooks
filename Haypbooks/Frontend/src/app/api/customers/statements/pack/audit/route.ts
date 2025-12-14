import { NextResponse } from 'next/server'
import { getRoleFromCookies, hasPermission } from '@/lib/rbac-server'
import { db, seedIfNeeded } from '@/mock/db'

// GET /api/customers/statements/pack/audit
// Returns recent batch statement send events (action=statement:send:batch) plus optional latest per-customer children when batchId filter provided.
export async function GET(req: Request) {
  const role = getRoleFromCookies()
  if (!hasPermission(role, 'audit:read')) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  seedIfNeeded()
  const url = new URL(req.url)
  const batchId = url.searchParams.get('batchId') || null
  const events = (db.auditEvents || []).filter((e: any) => e?.action === 'statement:send:batch')
    .sort((a: any,b: any) => (b.ts || '').localeCompare(a.ts || ''))
    .slice(0, 100)
  if (batchId) {
    // Attach per-customer children for that batch id
    const children = (db.auditEvents || []).filter((e: any) => e?.meta?.batchId === batchId && e?.action === 'statement:send')
      .sort((a: any,b: any) => (a.entityId || '').localeCompare(b.entityId || ''))
    return NextResponse.json({ events: events.filter(e => e.entityId === batchId), children })
  }
  return NextResponse.json({ events })
}
