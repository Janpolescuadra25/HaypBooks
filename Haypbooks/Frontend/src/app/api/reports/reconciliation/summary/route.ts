import { NextResponse } from 'next/server'
import { getRoleFromCookies, hasPermission } from '@/lib/rbac-server'
import { db } from '@/mock/db'

type ReconciliationSummary = {
  asOf: string
  statementEndDate: string
  statementEndingBalance: number
  beginningBalance: number
  clearedDebits: number
  clearedCredits: number
  outstandingChecks: number
  outstandingDeposits: number
  difference: number
  accountId: string
  items: Array<{ id: string; date: string; type: 'check' | 'deposit' | 'payment' | 'transfer'; amount: number; cleared: boolean; reconciled?: boolean; accountId: string }>
}

export async function GET(req: Request) {
  const role = getRoleFromCookies()
  if (!hasPermission(role, 'reports:read')) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const url = new URL(req.url)
  const asOfIso = (url.searchParams.get('asOf') || new Date().toISOString().slice(0,10))
  const statementEndDate = url.searchParams.get('statementEndDate') || asOfIso
  // Optional: allow passing an ending balance to compare against; default to derived cash
  const providedEnding = url.searchParams.get('endingBalance')
  // Optional: account filter (defaults to Cash 1000 if present)
  const qAccountId = url.searchParams.get('accountId') || undefined

  // Very light mock logic: treat db.transactions as bank activity; negative = check/payment, positive = deposit
  let clearedDebits = 0
  let clearedCredits = 0
  let outstandingChecks = 0
  let outstandingDeposits = 0
  const items: ReconciliationSummary['items'] = []
  // Resolve reconciling account: provided id if valid, else Cash (1000), else first account
  const cash = (db.accounts || []).find(a => (a as any).number === '1000')
  const fallback = cash?.id || (db.accounts?.[0]?.id || '')
  const accountExists = qAccountId ? (db.accounts || []).some(a => a.id === qAccountId) : false
  const accountId = accountExists ? String(qAccountId) : fallback

  for (const t of db.transactions || []) {
    const tIso = String(t.date || '').slice(0,10)
    if (!tIso || tIso > asOfIso) continue
    if (String(t.accountId || '') !== accountId) continue
    const isCredit = t.amount > 0
    const type: any = isCredit ? 'deposit' : (t.category === 'Transfer' ? 'transfer' : 'check')
    const cleared = Boolean((t as any).cleared) // allow toggling cleared flags in seed
    const reconciled = Boolean((t as any).reconciled)
    items.push({ id: t.id, date: tIso, type, amount: Number(t.amount), cleared, reconciled, accountId: String(t.accountId || accountId) })
    if (cleared) {
      if (isCredit) clearedCredits += t.amount
      else clearedDebits += Math.abs(t.amount)
    } else {
      if (isCredit) outstandingDeposits += t.amount
      else outstandingChecks += Math.abs(t.amount)
    }
  }

  // Derive a naive statement ending balance (mock): sum of cleared activity starting from zero
  const derivedEnding = Number((clearedCredits - clearedDebits).toFixed(2))
  const statementEndingBalance = providedEnding != null ? Number(providedEnding) : derivedEnding
  const difference = Number((statementEndingBalance - derivedEnding).toFixed(2))

  // Beginning balance: use latest prior reconciliation session for this account, else 0
  const prev = (db.reconcileSessions || [])
    .filter(s => s.accountId === accountId && typeof s.periodEnd === 'string' && s.periodEnd <= statementEndDate)
    .sort((a,b) => (b.periodEnd || '').localeCompare(a.periodEnd || ''))[0]
  const beginningBalance = prev ? Number(prev.endingBalance || 0) : 0

  const payload: ReconciliationSummary = {
    asOf: asOfIso,
    statementEndDate,
    statementEndingBalance,
    beginningBalance,
    clearedDebits: Number(clearedDebits.toFixed(2)),
    clearedCredits: Number(clearedCredits.toFixed(2)),
    outstandingChecks: Number(outstandingChecks.toFixed(2)),
    outstandingDeposits: Number(outstandingDeposits.toFixed(2)),
    difference,
    accountId,
    items: items.sort((a,b)=> a.date.localeCompare(b.date) || String(a.id).localeCompare(String(b.id)))
  }
  return NextResponse.json(payload, { headers: { 'Cache-Control': 'no-store' } })
}
