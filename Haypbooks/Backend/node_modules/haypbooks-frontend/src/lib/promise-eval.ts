import { db } from '@/mock/db'
import type { PromiseToPay } from '@/types/domain'

function sumPaymentsFor(customerId: string, invoiceIds: string[] | undefined, cutoffIso: string): number {
  let sum = 0
  for (const inv of db.invoices) {
    if (inv.customerId !== customerId) continue
    if (invoiceIds && invoiceIds.length && !invoiceIds.includes(inv.id)) continue
    for (const p of inv.payments) {
      const pIso = p.date.slice(0,10)
      if (pIso <= cutoffIso) sum += p.amount
    }
  }
  return Number(sum.toFixed(2))
}

/**
 * Evaluate promises and update their status in-place in the mock DB.
 * - Auto-kept: sum of payments (restricted to invoiceIds when provided) on/before promisedDate >= amount
 * - Auto-broken: promisedDate < today and still open
 */
export function evaluatePromises(asOfIso?: string) {
  const todayIso = (asOfIso || new Date().toISOString().slice(0,10))
  const list: PromiseToPay[] = (db as any).promises || []
  for (const p of list) {
    if (p.status !== 'open') continue
    // Auto-kept check first
    const paid = sumPaymentsFor(p.customerId, p.invoiceIds, p.promisedDate)
    if (paid >= p.amount) {
      p.status = 'kept'
      p.keptAt = new Date().toISOString()
      continue
    }
    // Then auto-broken if promisedDate has passed
    if (p.promisedDate < todayIso) {
      p.status = 'broken'
      p.brokenAt = new Date().toISOString()
    }
  }
}
