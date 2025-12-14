import { NextResponse } from 'next/server'
import { db, seedIfNeeded } from '@/mock/db'

// Simulate pulling new transactions from an aggregator
export async function POST() {
  if (!db.seeded) { try { seedIfNeeded() } catch {} }
  const before = db.transactions.length
  const cash = db.accounts.find((a: any) => a.number === '1000')!.id
  // Generate 10 imported rows with externalId to dedupe
  const today = new Date()
  for (let i = 0; i < 10; i++) {
    const d = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), Math.max(1, (i % 28) + 1)))
    const externalId = `agg_${d.toISOString().slice(0,10)}_${i}`
    // Skip if already present
    const dup = db.transactions.find(t => t.externalId === externalId)
    if (dup) continue
    db.transactions.push({
      id: `txn_${Math.random().toString(36).slice(2,8)}`,
      externalId,
      date: d.toISOString(),
      description: i % 2 === 0 ? 'ONLINE SALE' : 'SMALL TEST CHARGE',
      category: (i % 3 === 0 ? 'Income' : (i % 3 === 1 ? 'Expense' : 'Transfer')) as any,
      amount: i % 2 === 0 ? 125 : 5,
      accountId: cash,
      bankStatus: 'imported',
      source: 'import',
      tags: []
    })
  }
  const added = db.transactions.length - before
  return NextResponse.json({ ok: true, pulled: added, added })
}
