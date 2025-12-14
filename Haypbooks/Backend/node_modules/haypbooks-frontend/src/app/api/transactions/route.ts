import { NextResponse } from 'next/server'
import { getRoleFromCookies, hasPermission } from '@/lib/rbac-server'
import { seedIfNeeded, listTransactions as listDbTransactions, createTransaction as createDbTransaction, updateTransaction as updateDbTransaction, deleteTransaction as deleteDbTransaction, db, suggestMatchesForBankTransaction } from '@/mock/db'
import type { Transaction } from '../../../types/domain'

export async function GET(req: Request) {
  if (!db.seeded) { try { seedIfNeeded() } catch {} }
  const url = new URL(req.url)
  const page = parseInt(url.searchParams.get('page') || '1')
  const limit = parseInt(url.searchParams.get('limit') || '20')
  const start = url.searchParams.get('start')
  const end = url.searchParams.get('end')
  const type = url.searchParams.get('type')
  const bankStatus = url.searchParams.get('bankStatus')
  const accountId = url.searchParams.get('accountId')
  const tag = url.searchParams.get('tag')
  const includeSuggested = url.searchParams.get('includeSuggested') === '1'
  // Apply all filters against db.transactions so total reflects filters
  let all = db.transactions.slice().map(t => ({ ...t, date: t.date.slice(0,10) }))
  if (start) all = all.filter(t => t.date >= start)
  if (end) all = all.filter(t => t.date <= end)
  if (type) all = all.filter(t => t.category === type)
  if (bankStatus) {
    if (bankStatus === 'for_review') {
      all = all.filter(t => (t.bankStatus || 'for_review') === 'for_review' || t.bankStatus === 'imported')
    } else {
      all = all.filter(t => (t.bankStatus || 'for_review') === bankStatus)
    }
  }
  if (accountId) all = all.filter(t => t.accountId === accountId)
  if (tag) all = all.filter(t => Array.isArray(t.tags) && t.tags.includes(tag))
  const total = all.length
  const offset = (page - 1) * limit
  const data = all.slice(offset, offset + limit)
  // Optionally enrich with suggestedCount for For Review triage to reduce UI fetches
  const enriched = (includeSuggested || bankStatus === 'for_review')
    ? data.map((t) => {
        try {
          const res = suggestMatchesForBankTransaction(t.id, { limit: 3 })
          const count = Array.isArray(res?.candidates) ? res.candidates.length : 0
          return { ...t, suggestedCount: count }
        } catch {
          return { ...t, suggestedCount: 0 }
        }
      })
    : data
  return NextResponse.json({ transactions: enriched, total, page, limit })
}

export async function POST(req: Request) {
  const role = getRoleFromCookies()
  if (!hasPermission(role, 'journal:write')) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }
  if (!db.seeded) { try { seedIfNeeded() } catch {} }
  const body = await req.json().catch(() => ({}))
  const { date, description, category, amount, accountId, bankStatus } = body || {}
  if (!date || !description || typeof amount !== 'number') {
    return NextResponse.json({ error: 'date, description, amount are required' }, { status: 400 })
  }
  const input: Omit<Transaction,'id'> = {
    date,
    description,
    category: (category === 'Income' || category === 'Expense' || category === 'Transfer') ? category : 'Income',
    amount,
    accountId: accountId || db.accounts.find((a: any) => a.number === '1000')?.id || 'acc_1',
    bankStatus: bankStatus as any,
  }
  const txn = createDbTransaction(input)
  return NextResponse.json({ transaction: txn })
}

export async function PUT(req: Request) {
  const role = getRoleFromCookies()
  if (!hasPermission(role, 'journal:write')) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }
  if (!db.seeded) { try { seedIfNeeded() } catch {} }
  const body = await req.json().catch(() => ({}))
  const { id, date, description, category, amount, accountId, bankStatus, tags } = body || {}
  if (!id) return NextResponse.json({ error: 'id is required' }, { status: 400 })
  if (!date || !description || typeof amount !== 'number') {
    return NextResponse.json({ error: 'date, description, amount are required' }, { status: 400 })
  }
  const patch: Transaction = {
    id,
    date,
    description,
    category: (category === 'Income' || category === 'Expense' || category === 'Transfer') ? category : 'Income',
    amount,
    accountId: accountId || db.accounts.find((a: any) => a.number === '1000')?.id || 'acc_1',
    bankStatus: bankStatus as any,
    tags,
  }
  const txn = updateDbTransaction(patch)
  return NextResponse.json({ transaction: txn })
}

export async function DELETE(req: Request) {
  const role = getRoleFromCookies()
  if (!hasPermission(role, 'journal:write')) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }
  if (!db.seeded) { try { seedIfNeeded() } catch {} }
  const url = new URL(req.url)
  const id = url.searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'id is required' }, { status: 400 })
  deleteDbTransaction(id)
  return NextResponse.json({ ok: true })
}
