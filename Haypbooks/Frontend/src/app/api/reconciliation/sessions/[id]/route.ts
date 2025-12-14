import { NextResponse } from 'next/server'
import { db, seedIfNeeded, deleteReconcileSession } from '@/mock/db'
import { getRoleFromCookies, hasPermission } from '@/lib/rbac-server'

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  if (!db.seeded) { try { seedIfNeeded() } catch {}
  }
  const role = getRoleFromCookies()
  if (!hasPermission(role, 'journal:read')) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  const sess = (db.reconcileSessions || []).find(s => s.id === params.id)
  if (!sess) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  const account = (db.accounts || []).find(a => a.id === sess.accountId)
  const periodEnd = (sess.periodEnd || new Date().toISOString()).slice(0,10)
  // Lines: transactions for the account with date <= periodEnd
  const txns = (db.transactions || []).filter(t => t.accountId === sess.accountId && (t.date || '').slice(0,10) <= periodEnd)
  const lines = txns.map(t => ({ id: t.id, date: (t.date || '').slice(0,10), description: t.description, amount: Number(t.amount) || 0, cleared: (sess.clearedIds || []).includes(t.id) }))
  // Aggregates
  const beginningBalance = Number(sess.beginningBalance || 0)
  const endingBalance = Number(sess.endingBalance || 0)
  const serviceCharge = Number(sess.serviceCharge || 0)
  const interestEarned = Number(sess.interestEarned || 0)
  const clearedDepositsTotal = lines.filter(l => l.cleared && l.amount > 0).reduce((s,l)=> s + l.amount, 0)
  const clearedPaymentsTotalAbs = lines.filter(l => l.cleared && l.amount < 0).reduce((s,l)=> s + Math.abs(l.amount), 0)
  const adjustmentsTotal = (serviceCharge > 0 ? -serviceCharge : 0) + (interestEarned > 0 ? interestEarned : 0)
  const clearedBalance = beginningBalance - clearedPaymentsTotalAbs + clearedDepositsTotal + adjustmentsTotal
  const difference = endingBalance - clearedBalance
  return NextResponse.json({
    session: sess,
    account: account ? { id: account.id, number: (account as any).number, name: (account as any).name } : null,
    lines,
    aggregates: {
      beginningBalance,
      endingBalance,
      serviceCharge,
      interestEarned,
      clearedDepositsTotal,
      clearedPaymentsTotalAbs,
      adjustmentsTotal,
      clearedBalance,
      difference,
      periodEnd,
    }
  })
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  if (!db.seeded) { try { seedIfNeeded() } catch {} }
  const role = getRoleFromCookies()
  if (!hasPermission(role, 'journal:write')) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  const ok = deleteReconcileSession(params.id)
  if (!ok) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json({ ok: true })
}
