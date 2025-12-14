import { NextResponse } from 'next/server'
import { getRoleFromCookies, hasPermission } from '@/lib/rbac-server'
import { db } from '@/mock/db'

// Mock endpoint to queue sending a vendor statement with optional filters
export async function POST(req: Request, ctx: { params: { id: string } }) {
  const role = getRoleFromCookies()
  if (!hasPermission(role, 'bills:write')) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  const url = new URL(req.url)
  const id = ctx.params.id
  const asOf = url.searchParams.get('asOf') || new Date().toISOString().slice(0, 10)
  const start = url.searchParams.get('start') || null
  const type = url.searchParams.get('type') || null
  // Basic validation: asOf/start should be ISO-like when provided
  const isIso = (s: string) => /^\d{4}-\d{2}-\d{2}$/.test(s)
  if (!isIso(asOf) || (start && !isIso(start))) {
    return NextResponse.json({ error: 'Invalid parameters', details: { asOf, start, type } }, { status: 400 })
  }
  // Enforce vendor existence only when vendors have been seeded
  try {
    const list = (db.vendors || [])
    if (list.length > 0) {
      const exists = list.some(v => v.id === id)
      if (!exists) return NextResponse.json({ error: 'Vendor not found' }, { status: 404 })
    }
  } catch {}
  const messageId = `stmt_${Date.now().toString(36)}_${Math.random().toString(36).slice(2,8)}`
  const queuedAt = new Date().toISOString()
  try {
    ;(db.auditEvents ||= []).push({
      id: `aud_${Date.now().toString(36)}_${Math.random().toString(36).slice(2,6)}`,
      ts: queuedAt,
      actor: 'system',
      action: 'statement:send',
      entityType: 'vendor',
      entityId: id,
      after: { id, asOf, start, type, messageId, status: 'queued' },
      meta: { scope: 'ap' },
    } as any)
  } catch {}
  const payload = { id, asOf, start, type, status: 'queued', queuedAt, messageId }
  return NextResponse.json({ result: payload })
}
