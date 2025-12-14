import { NextResponse } from 'next/server'
import { db, seedIfNeeded } from '../../../../mock/db'

// Simple server-side aggregation for reconciliation snapshot
export async function GET() {
  // Ensure seed executed
  if (!db.seeded) { try { seedIfNeeded() } catch {} }
  const rows = db.transactions
  const buckets: Record<string,{ count: number; total: number }> = {}
  let inflows = 0, outflows = 0
  for (const t of rows) {
    const raw = t.bankStatus || 'for_review'
    const st = raw === 'imported' ? 'for_review' : raw
    if (!buckets[st]) buckets[st] = { count: 0, total: 0 }
    buckets[st].count++
    buckets[st].total += t.amount
    if (t.amount > 0) inflows += t.amount
    else outflows += Math.abs(t.amount)
  }
  const forReview = buckets['for_review']?.count || 0
  const categorized = buckets['categorized']?.count || 0
  const progress = (categorized + forReview) === 0 ? 0 : Math.round((categorized / (categorized + forReview)) * 100)
  return NextResponse.json({
    buckets: Object.entries(buckets).map(([status,v]) => ({ status, ...v })),
    inflows,
    outflows,
    net: inflows - outflows,
    progress,
    counts: { for_review: forReview, categorized, excluded: buckets['excluded']?.count || 0 }
  })
}
