import { NextResponse } from 'next/server'
import { getRoleFromCookies, hasPermission } from '@/lib/rbac-server'
import { db, seedIfNeeded, listReconcileSessions, createReconcileSession } from '@/mock/db'

export async function GET(req: Request) {
  if (!db.seeded) { try { seedIfNeeded() } catch {} }
  const role = getRoleFromCookies()
  if (!hasPermission(role, 'reports:read')) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  const { searchParams } = new URL(req.url)
  const accountId = searchParams.get('accountId') || undefined
  const sessions = listReconcileSessions(accountId)
  const rows = sessions.slice().sort((a,b) => (b.periodEnd || '').localeCompare(a.periodEnd || '') || (b.createdAt || '').localeCompare(a.createdAt || ''))
  return NextResponse.json({ sessions: rows })
}

export async function DELETE(req: Request) {
  if (!db.seeded) { try { seedIfNeeded() } catch {} }
  const role = getRoleFromCookies()
  if (!hasPermission(role, 'journal:write')) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  const url = new URL(req.url)
  const id = url.searchParams.get('id') || ''
  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 })
  const ok = await (async () => {
    try { return (await import('@/mock/db')).deleteReconcileSession(id) } catch { return false }
  })()
  if (!ok) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json({ ok: true })
}

export async function POST(req: Request) {
  if (!db.seeded) { try { seedIfNeeded() } catch {} }
  const role = getRoleFromCookies()
  if (!hasPermission(role, 'journal:write')) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  const body = await req.json().catch(() => ({})) as {
    accountId?: string
    periodEnd?: string
    endingBalance?: number
    beginningBalance?: number
    serviceCharge?: number
    interestEarned?: number
    clearedIds?: string[]
    note?: string
  }
  if (!body.accountId || !body.periodEnd || typeof body.endingBalance !== 'number' || !Array.isArray(body.clearedIds)) {
    return NextResponse.json({ error: 'accountId, periodEnd, endingBalance and clearedIds required' }, { status: 400 })
  }
  try {
    const sess = createReconcileSession({
      accountId: body.accountId,
      periodEnd: body.periodEnd,
      endingBalance: body.endingBalance,
      beginningBalance: body.beginningBalance,
      serviceCharge: body.serviceCharge,
      interestEarned: body.interestEarned,
      clearedIds: body.clearedIds,
      note: body.note,
    })
    return NextResponse.json({ session: sess }, { status: 201 })
  } catch (e: any) {
    const msg = String(e?.message || '')
    if (/Beginning balance must match/i.test(msg)) {
      return NextResponse.json({ error: 'Beginning balance must match the last reconciliation ending balance' }, { status: 400 })
    }
    if (/Difference must be zero/i.test(msg)) {
      return NextResponse.json({ error: 'Difference must be zero to finish' }, { status: 400 })
    }
    if (/Period end must be after/i.test(msg)) {
      return NextResponse.json({ error: 'Statement period end must be after the last reconciliation' }, { status: 400 })
    }
    if (/Cleared transactions must belong/i.test(msg)) {
      return NextResponse.json({ error: 'Cleared transactions must belong to the selected account' }, { status: 400 })
    }
    if (/Cleared transactions cannot be after/i.test(msg)) {
      return NextResponse.json({ error: 'Cleared transactions cannot be dated after the statement period end' }, { status: 400 })
    }
    if (/Invalid periodEnd/i.test(msg)) {
      return NextResponse.json({ error: 'Invalid period end date' }, { status: 400 })
    }
    return NextResponse.json({ error: 'Failed to finalize reconciliation' }, { status: 400 })
  }
}
