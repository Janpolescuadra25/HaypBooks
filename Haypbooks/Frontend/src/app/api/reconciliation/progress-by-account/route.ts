import { NextResponse } from 'next/server'
import { db, seedIfNeeded } from '../../../../mock/db'

// Returns reconciliation progress grouped by account
export async function GET() {
  if (!db.seeded) { try { seedIfNeeded() } catch {} }

  const byAccount: Record<string, any> = {}
  for (const t of db.transactions) {
    const aId = t.accountId
    if (!byAccount[aId]) {
      const acc = db.accounts.find(a => a.id === aId)
      byAccount[aId] = {
        accountId: aId,
        accountNumber: acc?.number || '0000',
        accountName: acc?.name || 'Unknown',
        counts: { for_review: 0, categorized: 0, excluded: 0, imported: 0 },
        inflows: 0,
        outflows: 0,
        net: 0,
        progress: 0,
      }
    }
    const row = byAccount[aId]
  const st = (t.bankStatus || 'for_review') as 'for_review' | 'categorized' | 'excluded' | 'imported'
  // Treat imported as for_review for progress purposes
  const eff: 'for_review' | 'categorized' | 'excluded' | 'imported' = (st === 'imported') ? 'for_review' : st
  if (eff in row.counts) row.counts[eff] += 1
    if (t.amount > 0) row.inflows += t.amount
    else row.outflows += Math.abs(t.amount)
  }

  const accounts = Object.values(byAccount).map((row: any) => {
    const denom = row.counts.for_review + row.counts.categorized
    row.net = row.inflows - row.outflows
    row.progress = denom === 0 ? 0 : Math.round((row.counts.categorized / denom) * 100)
    return row
  }).sort((a: any, b: any) => (a.accountNumber || '').localeCompare(b.accountNumber || ''))

  return NextResponse.json({ accounts })
}
