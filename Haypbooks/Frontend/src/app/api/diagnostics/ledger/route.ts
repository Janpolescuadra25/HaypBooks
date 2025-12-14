import { NextResponse } from 'next/server'
// Use relative import because alias for mock not defined in tsconfig paths
import { db, seedIfNeeded } from '../../../../mock/db'

export async function GET() {
  if (!db.seeded) { try { seedIfNeeded() } catch {} }
  const journals = db.journalEntries || []
  let totalDebits = 0, totalCredits = 0
  for (const je of journals) {
    for (const l of je.lines) { totalDebits += l.debit || 0; totalCredits += l.credit || 0 }
  }
  // Build a simple trial balance snapshot from journal lines
  const accMap: Record<string,{ name: string; debits: number; credits: number }> = {}
  for (const je of journals) {
    for (const l of je.lines) {
      const acc = db.accounts.find((a: any) => a.id === l.accountId)
      if (!acc) continue
      const slot = accMap[acc.id] || { name: acc.name, debits: 0, credits: 0 }
      slot.debits += l.debit || 0
      slot.credits += l.credit || 0
      accMap[acc.id] = slot
    }
  }
  const trial = Object.entries(accMap).map(([accountId, v]) => ({ accountId, name: v.name, debits: v.debits, credits: v.credits, net: v.debits - v.credits }))
  return NextResponse.json({
    journalCount: journals.length,
    totalDebits,
    totalCredits,
    difference: Number((totalDebits - totalCredits).toFixed(2)),
    trial,
  })
}
