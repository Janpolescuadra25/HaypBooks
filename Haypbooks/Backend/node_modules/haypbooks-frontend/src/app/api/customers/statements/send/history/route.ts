import { NextResponse } from 'next/server'
import { getRoleFromCookies, hasPermission } from '@/lib/rbac-server'
import { db, seedIfNeeded } from '@/mock/db'

// GET /api/customers/statements/send/history?start=YYYY-MM-DD&end=YYYY-MM-DD&customerId=...&batchId=...
// Returns per-customer statement send audit events (action=statement:send)
export async function GET(req: Request) {
  const role = getRoleFromCookies()
  if (!hasPermission(role, 'audit:read') || !hasPermission(role, 'reports:read')) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  seedIfNeeded()
  const url = new URL(req.url)
  const start = url.searchParams.get('start') || null
  const end = url.searchParams.get('end') || null
  const customerId = url.searchParams.get('customerId') || null
  const batchId = url.searchParams.get('batchId') || null
  const events = (db.auditEvents || []).filter((e: any) => e?.action === 'statement:send')
  const rows: any[] = []
  for (const ev of events) {
    const a = ev.after || {}
    const eventDate = (a.queuedAt || ev.ts || '').slice(0,10)
    if (start && (!eventDate || eventDate < start)) continue
    if (end && (!eventDate || eventDate > end)) continue
    if (customerId && a.id !== customerId) continue
    if (batchId && (a.batchId || ev.meta?.batchId) !== batchId) continue
    rows.push({
      ts: ev.ts,
      date: eventDate,
      customerId: a.id,
      asOf: a.asOf,
      start: a.start || null,
      type: a.type,
      status: a.status || 'queued',
      messageId: a.messageId || null,
      batchId: a.batchId || ev.meta?.batchId || null
    })
  }
  rows.sort((a,b)=> (b.ts||'').localeCompare(a.ts||''))
  return NextResponse.json({ history: { start, end, customerId, batchId, count: rows.length, rows } })
}
