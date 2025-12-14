import { NextResponse } from 'next/server'
import { db, seedIfNeeded, listReconcileSessions, hasReconciliationDiscrepancy } from '@/mock/db'
import { getRoleFromCookies, hasPermission } from '@/lib/rbac-server'
import { deriveRange } from '@/lib/report-helpers'

export async function GET(req: Request) {
  if (!db.seeded) { try { seedIfNeeded() } catch {} }
  const role = getRoleFromCookies()
  if (!hasPermission(role, 'reports:read')) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const url = new URL(req.url)
  const period = url.searchParams.get('period') || undefined
  const startParam = url.searchParams.get('start') || undefined
  const endParam = url.searchParams.get('end') || undefined
  const { start, end } = deriveRange(period, startParam ?? null, endParam ?? null)
  const startIso = start || undefined
  const endIso = end || undefined
  const accountId = url.searchParams.get('accountId') || undefined

  // Choose account: explicit or default Cash (1000)
  let accId = accountId
  if (!accId) {
    const cash = db.accounts.find(a => a.number === '1000')
    accId = cash?.id || db.accounts[0]?.id
  }
  if (!accId) return NextResponse.json({ error: 'No accounts available' }, { status: 400 })

  // Filter transactions for account and date range
  let rows = db.transactions.filter(t => t.accountId === accId)
  if (startIso) rows = rows.filter(t => (t.date || '').slice(0,10) >= startIso)
  if (endIso) rows = rows.filter(t => (t.date || '').slice(0,10) <= endIso)
  rows = rows.slice().sort((a,b) => (a.date || '').localeCompare(b.date || '') || a.id.localeCompare(b.id))

  // Opening balance = sum of amounts prior to start; if no start, treat opening as 0 for register view
  let openingBalance = 0
  if (startIso) {
    openingBalance = db.transactions
      .filter(t => t.accountId === accId && (t.date || '').slice(0,10) < startIso)
      .reduce((s,t) => s + Number(t.amount || 0), 0)
  }
  let running = openingBalance
  const out = rows.map(t => {
    running += Number(t.amount || 0)
    return {
      id: t.id,
      date: (t.date || '').slice(0,10),
      description: t.description || '',
      amount: Number(t.amount || 0),
      runningBalance: running,
      bankStatus: t.bankStatus || 'for_review',
      cleared: !!t.cleared,
      reconciled: !!t.reconciled,
      matchedKind: (t as any).matchedKind || undefined,
      matchedId: (t as any).matchedId || undefined,
      matchedRef: (t as any).matchedRef || undefined,
    }
  })
  const closingBalance = running
  const account = db.accounts.find(a => a.id === accId)
  // Determine if the latest reconciliation snapshot for this account shows a discrepancy vs current data
  let reconcileDiscrepancy: boolean | undefined
  try {
    const sessions = listReconcileSessions(accId)
    const last = sessions[sessions.length - 1]
    if (last) reconcileDiscrepancy = hasReconciliationDiscrepancy(last)
  } catch {}
  return NextResponse.json({
    account: account ? { id: account.id, number: account.number, name: account.name } : { id: accId },
    start: startIso || null,
    end: endIso || null,
    openingBalance,
    closingBalance,
    rows: out,
    reconcileDiscrepancy: !!reconcileDiscrepancy,
  })
}
