import { NextResponse } from 'next/server'
import { db, seedIfNeeded, listReconcileSessions } from '@/mock/db'
import { getRoleFromCookies, hasPermission } from '@/lib/rbac-server'

export async function GET(req: Request) {
  if (!db.seeded) { try { seedIfNeeded() } catch {} }
  const role = getRoleFromCookies()
  // Reading balances is similar to reports, so require reports:read (or journal:read)
  if (!hasPermission(role, 'reports:read') && !hasPermission(role, 'journal:read')) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }
  const url = new URL(req.url)
  const accountId = url.searchParams.get('accountId') || ''
  if (!accountId) return NextResponse.json({ error: 'accountId required' }, { status: 400 })
  const acc = (db.accounts || []).find((a: any) => a.id === accountId)
  if (!acc) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const booksBalance = Number(acc.balance || 0)
  // Latest reconciliation session (if any)
  const sessions = listReconcileSessions(accountId)
  const last = sessions.slice().sort((a,b) => (b.periodEnd || '').localeCompare(a.periodEnd || '') || (b.createdAt || '').localeCompare(a.createdAt || ''))[0]
  const statementBalance = last ? Number(last.endingBalance || 0) : null
  const statementDate = last ? String(last.periodEnd || '').slice(0,10) : null

  // Approximate current "Bank Balance": start from last statement balance, then add amounts of transactions after that date that are marked cleared
  let bankBalance: number | null = null
  try {
    const afterIso = last ? String(last.periodEnd || '').slice(0,10) : null
    const txns = (db.transactions || []).filter((t: any) => t.accountId === accountId)
    if (last && afterIso) {
      const delta = txns
        .filter((t: any) => String(t.date || '').slice(0,10) > afterIso && t.cleared === true)
        .reduce((s, t) => s + Number(t.amount || 0), 0)
      bankBalance = Number((Number(statementBalance || 0) + delta).toFixed(2))
    } else {
      // Fallback when no reconciliation exists yet: sum cleared amounts (no baseline available)
      const clearedSum = txns.filter((t: any) => t.cleared === true).reduce((s, t) => s + Number(t.amount || 0), 0)
      bankBalance = Number(clearedSum.toFixed(2))
    }
  } catch {
    bankBalance = null
  }

  const differenceToBooks = (typeof bankBalance === 'number') ? Number((bankBalance - booksBalance).toFixed(2)) : null

  return NextResponse.json({
    account: { id: acc.id, number: acc.number, name: acc.name },
    booksBalance,
    bankBalance,
    statementBalance,
    statementDate,
    differenceToBooks,
  })
}
