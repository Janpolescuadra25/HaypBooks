import { NextResponse } from 'next/server'
import { getRoleFromCookies, hasPermission } from '@/lib/rbac-server'
import { suggestMatchesForBankTransaction } from '@/mock/db'

export async function GET(req: Request) {
  const role = getRoleFromCookies()
  if (!hasPermission(role, 'reports:read')) return new NextResponse('Forbidden', { status: 403 })
  const url = new URL(req.url)
  const txnId = url.searchParams.get('txnId')
  const limit = url.searchParams.get('limit')
  const windowDays = url.searchParams.get('windowDays')
  const amountTolerance = url.searchParams.get('amountTolerance')
  if (!txnId) return NextResponse.json({ error: 'txnId required' }, { status: 400 })
  try {
    const result = suggestMatchesForBankTransaction(txnId, {
      limit: limit ? Number(limit) : undefined,
      windowDays: windowDays ? Number(windowDays) : undefined,
      amountTolerance: amountTolerance ? Number(amountTolerance) : undefined,
    })
    return NextResponse.json({ ok: true, result })
  } catch (e: any) {
    const msg = e?.message || 'Failed to suggest matches'
    return NextResponse.json({ error: msg }, { status: /not found/i.test(msg) ? 404 : 400 })
  }
}
