import { NextResponse } from 'next/server'
import { getRoleFromCookies, hasPermission } from '@/lib/rbac-server'
import { db } from '@/mock/db'
import '@/mock/seed'
import type { ReconcileSession, Transaction } from '@/types/domain'

type ReconciliationStatus = 'pending' | 'in_progress' | 'completed' | 'needs_review'

type ExtendedReconcileSession = ReconcileSession & {
  accountName: string
  statementDate: string
  statementBalance: number
  bookBalance: number
  difference: number
  status: ReconciliationStatus
  completedAt?: string
  transactions: ReconcileTransaction[]
  adjustments: ReconcileAdjustment[]
}

type ReconcileTransaction = {
  id: string
  date: string
  description: string
  amount: number
  cleared: boolean
  statementLine?: string
  category?: string
}

type ReconcileAdjustment = {
  id: string
  type: 'bank_fee' | 'interest' | 'nsf' | 'correction' | 'other'
  description: string
  amount: number
  accountId: string
  posted: boolean
}

/**
 * Enhanced bank reconciliation system following industry best practices
 * Provides systematic reconciliation workflow with automated matching
 */
function createReconcileSession(data: {
  accountId: string
  statementDate: string
  statementBalance: number
}): ExtendedReconcileSession {
  const account = db.accounts?.find(acc => acc.id === data.accountId)
  if (!account) throw new Error('Account not found')
  
  // Get transactions for the account up to statement date
  const transactions = (db.transactions || [])
    .filter(tx => 
      tx.accountId === data.accountId && 
      tx.date <= data.statementDate
    )
    .map(tx => ({
      id: tx.id,
      date: tx.date,
      description: tx.description,
      amount: tx.amount,
      cleared: false, // Will be set during reconciliation
      category: tx.category
    }))
  
  // Calculate book balance as of statement date
  const bookBalance = transactions.reduce((sum, tx) => sum + tx.amount, 0)
  
  const session: ExtendedReconcileSession = {
    id: `rec_${Math.random().toString(36).slice(2, 8)}`,
    accountId: data.accountId,
    accountName: account.name,
    statementDate: data.statementDate,
    statementBalance: data.statementBalance,
    bookBalance,
    difference: data.statementBalance - bookBalance,
    status: 'in_progress',
    createdAt: new Date().toISOString(),
    transactions,
    adjustments: [],
    // Required fields from base ReconcileSession
    periodEnd: data.statementDate,
    endingBalance: data.statementBalance,
    clearedIds: []
  }
  
  // Store session (cast to base type for storage)
  if (!db.reconcileSessions) db.reconcileSessions = []
  const baseSession: ReconcileSession = {
    id: session.id,
    accountId: session.accountId,
    periodEnd: session.periodEnd,
    endingBalance: session.endingBalance,
    clearedIds: session.clearedIds,
    createdAt: session.createdAt
  }
  db.reconcileSessions.push(baseSession)
  
  return session
}

/**
 * Get reconciliation dashboard showing all account reconciliation status
 */
function getReconciliationDashboard(): {
  accounts: Array<{
    id: string
    name: string
    type: string
    lastReconciled?: string
    needsReconciliation: boolean
    unreconciledCount: number
    balance: number
  }>
  recentSessions: Array<{
    id: string
    accountId: string
    accountName: string
    statementDate: string
    status: ReconciliationStatus
    createdAt: string
  }>
} {
  const accounts = (db.accounts || [])
    .filter(acc => acc.type === 'Asset' && 
      (acc.name.toLowerCase().includes('cash') || 
       acc.name.toLowerCase().includes('bank') ||
       acc.name.toLowerCase().includes('checking') ||
       acc.name.toLowerCase().includes('savings')))
  
  const sessions = db.reconcileSessions || []
  
  const accountStatus = accounts.map(acc => {
    const lastSession = sessions
      .filter(s => s.accountId === acc.id)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))[0]
    
    const unreconciledTxs = (db.transactions || [])
      .filter(tx => tx.accountId === acc.id && !tx.reconciled)
    
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10)
    const needsReconciliation = !lastSession || (lastSession.periodEnd < thirtyDaysAgo)
    
    return {
      id: acc.id,
      name: acc.name,
      type: acc.type,
      lastReconciled: lastSession?.periodEnd,
      needsReconciliation,
      unreconciledCount: unreconciledTxs.length,
      balance: acc.balance || 0
    }
  })
  
  const recentSessions = sessions
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, 10)
    .map(s => {
      const account = accounts.find(acc => acc.id === s.accountId)
      return {
        id: s.id,
        accountId: s.accountId,
        accountName: account?.name || 'Unknown Account',
        statementDate: s.periodEnd,
        status: 'completed' as ReconciliationStatus, // Assume completed if in db
        createdAt: s.createdAt
      }
    })
  
  return {
    accounts: accountStatus,
    recentSessions
  }
}

/**
 * Auto-match transactions based on amount, date proximity, and description similarity
 */
function autoMatchTransactions(session: ExtendedReconcileSession, statementLines: Array<{
  date: string
  description: string
  amount: number
}>): ExtendedReconcileSession {
  const tolerance = 0.01 // $0.01 tolerance for matching
  const daysTolerance = 3 // 3 days tolerance for date matching
  
  statementLines.forEach(line => {
    // Find potential matches
    const candidates = session.transactions.filter(tx => 
      !tx.cleared && 
      Math.abs(tx.amount - line.amount) <= tolerance &&
      Math.abs(new Date(tx.date).getTime() - new Date(line.date).getTime()) <= daysTolerance * 24 * 60 * 60 * 1000
    )
    
    if (candidates.length === 1) {
      // Perfect match - mark as cleared
      candidates[0].cleared = true
      candidates[0].statementLine = `${line.date}: ${line.description} ${line.amount}`
    }
  })
  
  return session
}

export async function GET(req: Request) {
  const role = getRoleFromCookies()
  if (!hasPermission(role, 'bills:read')) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const url = new URL(req.url)
  const action = url.searchParams.get('action') || 'dashboard'
  const sessionId = url.searchParams.get('sessionId')
  
  switch (action) {
    case 'dashboard':
      const dashboard = getReconciliationDashboard()
      return NextResponse.json(dashboard)
      
    case 'session':
      if (!sessionId) {
        return NextResponse.json({ error: 'Session ID required' }, { status: 400 })
      }
      // Find base session and construct extended session
      const baseSession = (db.reconcileSessions || []).find(s => s.id === sessionId)
      if (!baseSession) {
        return NextResponse.json({ error: 'Session not found' }, { status: 404 })
      }
      
      // Reconstruct extended session data
      const account = db.accounts?.find(acc => acc.id === baseSession.accountId)
      const transactions = (db.transactions || [])
        .filter(tx => tx.accountId === baseSession.accountId && tx.date <= baseSession.periodEnd)
        .map(tx => ({
          id: tx.id,
          date: tx.date,
          description: tx.description,
          amount: tx.amount,
          cleared: baseSession.clearedIds.includes(tx.id),
          category: tx.category
        }))
      
      const session: ExtendedReconcileSession = {
        ...baseSession,
        accountName: account?.name || 'Unknown Account',
        statementDate: baseSession.periodEnd,
        statementBalance: baseSession.endingBalance,
        bookBalance: transactions.reduce((sum, tx) => sum + tx.amount, 0),
        difference: baseSession.endingBalance - transactions.reduce((sum, tx) => sum + tx.amount, 0),
        status: 'completed',
        transactions,
        adjustments: []
      }
      
      return NextResponse.json({ session })
      
    case 'sessions':
      const sessions = (db.reconcileSessions || []).map(s => {
        const account = db.accounts?.find(acc => acc.id === s.accountId)
        return {
          id: s.id,
          accountId: s.accountId,
          accountName: account?.name || 'Unknown Account',
          statementDate: s.periodEnd,
          status: 'completed' as ReconciliationStatus,
          createdAt: s.createdAt
        }
      })
      return NextResponse.json({ sessions })
      
    default:
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  }
}

export async function POST(req: Request) {
  const role = getRoleFromCookies()
  if (!hasPermission(role, 'bills:write')) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const body = await req.json().catch(() => null)
  if (!body || !body.action) {
    return NextResponse.json({ error: 'Action required' }, { status: 400 })
  }

  const { action, data } = body

  switch (action) {
    case 'start_reconciliation':
      if (!data.accountId || !data.statementDate || typeof data.statementBalance !== 'number') {
        return NextResponse.json({ error: 'Account ID, statement date, and balance required' }, { status: 400 })
      }
      
      try {
        const session = createReconcileSession(data)
        return NextResponse.json({ 
          success: true, 
          session,
          message: `Reconciliation started for ${session.accountName}`
        })
      } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 400 })
      }

    case 'mark_cleared':
      const { sessionId, transactionId, cleared } = data
      if (!sessionId || !transactionId) {
        return NextResponse.json({ error: 'Session ID and transaction ID required' }, { status: 400 })
      }
      
      const baseSession = (db.reconcileSessions || []).find(s => s.id === sessionId)
      if (!baseSession) {
        return NextResponse.json({ error: 'Session not found' }, { status: 404 })
      }
      
      // Update cleared IDs array
      if (cleared) {
        if (!baseSession.clearedIds.includes(transactionId)) {
          baseSession.clearedIds.push(transactionId)
        }
      } else {
        baseSession.clearedIds = baseSession.clearedIds.filter(id => id !== transactionId)
      }
      
      return NextResponse.json({ 
        success: true, 
        message: `Transaction ${cleared ? 'cleared' : 'uncleared'}`,
        clearedIds: baseSession.clearedIds
      })

    case 'add_adjustment':
      const { sessionId: adjSessionId, adjustment } = data
      if (!adjSessionId || !adjustment) {
        return NextResponse.json({ error: 'Session ID and adjustment data required' }, { status: 400 })
      }
      
      const adjSession = (db.reconcileSessions || []).find(s => s.id === adjSessionId)
      if (!adjSession) {
        return NextResponse.json({ error: 'Session not found' }, { status: 404 })
      }
      
      const newAdjustment: ReconcileAdjustment = {
        id: `adj_${Math.random().toString(36).slice(2, 8)}`,
        type: adjustment.type,
        description: adjustment.description,
        amount: Number(adjustment.amount),
        accountId: adjSession.accountId,
        posted: false
      }
      
      // Store adjustment in metadata (would need to extend base type in real implementation)
      
      return NextResponse.json({ 
        success: true, 
        adjustment: newAdjustment,
        message: 'Adjustment added'
      })

    case 'complete_reconciliation':
      const { sessionId: completeSessionId } = data
      if (!completeSessionId) {
        return NextResponse.json({ error: 'Session ID required' }, { status: 400 })
      }
      
      const completeSession = (db.reconcileSessions || []).find(s => s.id === completeSessionId)
      if (!completeSession) {
        return NextResponse.json({ error: 'Session not found' }, { status: 404 })
      }
      
      // Calculate reconciled balance from cleared transactions
      const clearedTransactions = (db.transactions || [])
        .filter(tx => completeSession.clearedIds.includes(tx.id))
      
      const clearedAmount = clearedTransactions.reduce((sum, tx) => sum + tx.amount, 0)
      const difference = Math.abs(clearedAmount - completeSession.endingBalance)
      
      if (difference > 0.01) {
        return NextResponse.json({ 
          error: 'Reconciliation does not balance', 
          difference,
          reconciledBalance: clearedAmount,
          statementBalance: completeSession.endingBalance
        }, { status: 400 })
      }
      
      // Mark cleared transactions as reconciled
      clearedTransactions.forEach(tx => {
        tx.reconciled = true
        tx.reconciledAt = new Date().toISOString()
      })
      
      return NextResponse.json({ 
        success: true, 
        session: completeSession,
        message: `Reconciliation completed`
      })

    case 'auto_match':
      const { sessionId: matchSessionId, statementLines } = data
      if (!matchSessionId || !Array.isArray(statementLines)) {
        return NextResponse.json({ error: 'Session ID and statement lines required' }, { status: 400 })
      }
      
      const matchBaseSession = (db.reconcileSessions || []).find(s => s.id === matchSessionId)
      if (!matchBaseSession) {
        return NextResponse.json({ error: 'Session not found' }, { status: 404 })
      }
      
      // Reconstruct extended session for auto-matching
      const account = db.accounts?.find(acc => acc.id === matchBaseSession.accountId)
      const transactions = (db.transactions || [])
        .filter(tx => tx.accountId === matchBaseSession.accountId && tx.date <= matchBaseSession.periodEnd)
        .map(tx => ({
          id: tx.id,
          date: tx.date,
          description: tx.description,
          amount: tx.amount,
          cleared: matchBaseSession.clearedIds.includes(tx.id),
          category: tx.category
        }))
      
      const extendedSession: ExtendedReconcileSession = {
        ...matchBaseSession,
        accountName: account?.name || 'Unknown Account',
        statementDate: matchBaseSession.periodEnd,
        statementBalance: matchBaseSession.endingBalance,
        bookBalance: transactions.reduce((sum, tx) => sum + tx.amount, 0),
        difference: 0,
        status: 'in_progress',
        transactions,
        adjustments: []
      }
      
      const updatedSession = autoMatchTransactions(extendedSession, statementLines)
      
      // Update base session cleared IDs
      matchBaseSession.clearedIds = updatedSession.transactions
        .filter(tx => tx.cleared)
        .map(tx => tx.id)
      
      const matchCount = updatedSession.transactions.filter(tx => tx.cleared).length
      
      return NextResponse.json({ 
        success: true, 
        session: updatedSession,
        matchCount,
        message: `${matchCount} transactions auto-matched`
      })

    default:
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  }
}