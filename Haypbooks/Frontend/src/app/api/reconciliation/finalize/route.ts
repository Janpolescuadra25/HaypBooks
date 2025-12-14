import { NextResponse } from 'next/server'
import { getRoleFromCookies, hasPermission } from '@/lib/rbac-server'
import { db, seedIfNeeded, createReconcileSession } from '@/mock/db'

export async function POST(req: Request) {
  const role = getRoleFromCookies()
  if (!hasPermission(role, 'journal:write')) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  if (!db.seeded) { try { seedIfNeeded() } catch {} }
  const body = await req.json().catch(() => ({}))
  const { accountId, periodEnd, endingBalance, beginningBalance, serviceCharge, interestEarned, clearedIds } = body || {}
  if (!accountId || !periodEnd || typeof endingBalance !== 'number' || !Array.isArray(clearedIds)) {
    return NextResponse.json({ error: 'accountId, periodEnd, endingBalance, clearedIds required' }, { status: 400 })
  }
  try {
    const sess = createReconcileSession({ accountId, periodEnd, endingBalance, beginningBalance, serviceCharge, interestEarned, clearedIds })
    return NextResponse.json({ session: sess })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'failed' }, { status: 400 })
  }
}
