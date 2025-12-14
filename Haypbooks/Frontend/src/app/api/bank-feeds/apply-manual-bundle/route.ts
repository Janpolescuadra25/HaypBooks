import { NextResponse } from 'next/server'
import { getRoleFromCookies, hasPermission } from '@/lib/rbac-server'
import { applyManualMatchBundle } from '@/mock/db'

export async function POST(req: Request) {
  const role = getRoleFromCookies()
  if (!hasPermission(role, 'journal:write')) return new NextResponse('Forbidden', { status: 403 })
  let body: any = null
  try { body = await req.json() } catch { return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 }) }
  const { txnId, kind, selections, manualAdjustment, date } = body || {}
  if (!txnId || !kind || !Array.isArray(selections)) return NextResponse.json({ error: 'txnId, kind, selections required' }, { status: 400 })
  if (kind !== 'invoice' && kind !== 'bill') return NextResponse.json({ error: 'kind must be invoice or bill' }, { status: 400 })
  try {
  const result = applyManualMatchBundle({ txnId, kind, selections, manualAdjustment, date })
    return NextResponse.json({ ok: true, result })
  } catch (e: any) {
    const msg = e?.message || 'Failed to apply manual bundle'
    const status = /not found|exceeds/i.test(msg) ? 400 : 400
    return NextResponse.json({ error: msg }, { status })
  }
}
