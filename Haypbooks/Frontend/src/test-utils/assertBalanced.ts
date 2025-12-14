import { db } from '@/mock/db'

/**
 * assertBalanced
 * Verifies total debits equal total credits across all journal entries.
 * Throws with a detailed diff if imbalance is detected.
 * Accepts an optional label to contextualize failures.
 */
export function assertBalanced(label?: string) {
  const entries = db.journalEntries || []
  let debits = 0
  let credits = 0
  for (const je of entries) {
    for (const l of je.lines) {
      debits += l.debit || 0
      credits += l.credit || 0
    }
  }
  const delta = +(debits - credits).toFixed(4)
  if (Math.abs(delta) > 0.0001) {
    throw new Error(`Ledger out of balance${label ? ' ('+label+')' : ''}: debits=${debits.toFixed(2)} credits=${credits.toFixed(2)} delta=${delta}`)
  }
}
