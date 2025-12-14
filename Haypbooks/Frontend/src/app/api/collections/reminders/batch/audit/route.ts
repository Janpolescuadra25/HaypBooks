import { NextResponse } from 'next/server'
import { getRoleFromCookies, hasPermission } from '@/lib/rbac-server'
import { db, seedIfNeeded } from '@/mock/db'

// GET /api/collections/reminders/batch/audit[?batchId=...] lists recent reminder:send:batch events or details of a specific batch with children invoice reminders.
export async function GET(req: Request) {
  const role = getRoleFromCookies()
  if (!hasPermission(role, 'audit:read')) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  seedIfNeeded()
  const url = new URL(req.url)
  const batchId = url.searchParams.get('batchId') || null
  const wrappers = (db.auditEvents || []).filter((e: any) => e?.action === 'reminder:send:batch')
    .sort((a: any,b: any) => (b.ts || '').localeCompare(a.ts || ''))
    .slice(0, 100)
  if (batchId) {
    const children = (db.auditEvents || []).filter((e: any) => e?.action === 'invoice:reminder' && e?.meta?.batchId === batchId)
      .sort((a: any,b: any) => (a.entityId || '').localeCompare(b.entityId || ''))
    return NextResponse.json({ events: wrappers.filter(w => w.entityId === batchId), children })
  }
  return NextResponse.json({ events: wrappers })
}
