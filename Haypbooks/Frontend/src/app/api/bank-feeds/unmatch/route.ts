import { NextResponse } from 'next/server'
import { getRoleFromCookies, hasPermission } from '@/lib/rbac-server'
import { undoMatchForBankTransaction } from '@/mock/db'

export async function POST(req: Request) {
  const role = getRoleFromCookies()
  if (!hasPermission(role, 'journal:write')) return new NextResponse('Forbidden', { status: 403 })
  let body: any
  try { body = await req.json() } catch { return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 }) }
  const { txnId, reversalDate } = body || {}
  if (!txnId) return NextResponse.json({ error: 'txnId is required' }, { status: 400 })
  try {
    const result = undoMatchForBankTransaction({ txnId, reversalDate })
    return NextResponse.json({ ok: true, result })
  } catch (e: any) {
    const msg = e?.message || 'Failed to unmatch'
    return NextResponse.json({ error: msg }, { status: /not found|cannot unmatch|No match/i.test(msg) ? 400 : 500 })
  }
}
