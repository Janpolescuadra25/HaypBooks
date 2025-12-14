import { NextResponse } from 'next/server'
import { getRoleFromCookies, hasPermission } from '@/lib/rbac-server'
import { applyMatchToBankTransaction } from '@/mock/db'

export async function POST(req: Request) {
  const role = getRoleFromCookies()
  // Matching posts cash movements; require journal:write
  if (!hasPermission(role, 'journal:write')) return new NextResponse('Forbidden', { status: 403 })
  let body: any = null
  try { body = await req.json() } catch { return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 }) }
  const { txnId, kind, id, date } = body || {}
  if (!txnId || !kind || !id) return NextResponse.json({ error: 'txnId, kind, and id are required' }, { status: 400 })
  if (kind !== 'invoice' && kind !== 'bill' && kind !== 'deposit' && kind !== 'transfer') return NextResponse.json({ error: 'kind must be invoice, bill, deposit, or transfer' }, { status: 400 })
  try {
    const result = applyMatchToBankTransaction({ txnId, kind, id, date })
    return NextResponse.json({ ok: true, result })
  } catch (e: any) {
    const msg = e?.message || 'Failed to apply match'
    const status = /not found/i.test(msg) ? 404 : 400
    return NextResponse.json({ error: msg }, { status })
  }
}
