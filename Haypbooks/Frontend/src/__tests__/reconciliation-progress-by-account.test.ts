import { seedIfNeeded, db } from '@/mock/db'
import { GET as progressGet } from '@/app/api/reconciliation/progress-by-account/route'

function sum<T>(arr: T[], f: (t: T) => number) { return arr.reduce((s, x) => s + f(x), 0) }

describe('Reconciliation progress by account API', () => {
  beforeAll(() => { seedIfNeeded() })
  it('returns per-account progress, counts, and totals consistent with transactions', async () => {
    const res: any = await progressGet()
    expect(res.status).toBe(200)
    const json = await res.json()
    expect(Array.isArray(json.accounts)).toBe(true)
    expect(json.accounts.length).toBeGreaterThan(0)

    // Counts should add up across accounts to the total categorized + for_review + excluded + imported
    const totalTxns = db.transactions.length
    const totalCounts = sum(json.accounts, (a: any) => a.counts.for_review + a.counts.categorized + a.counts.excluded + a.counts.imported)
    expect(totalCounts).toBe(totalTxns)

    // Progress should be 0..100
    for (const a of json.accounts) {
      expect(a.progress).toBeGreaterThanOrEqual(0)
      expect(a.progress).toBeLessThanOrEqual(100)
      // Net = inflows - outflows
      expect(a.net).toBeCloseTo(a.inflows - a.outflows)
      expect(a).toHaveProperty('accountId')
      expect(a).toHaveProperty('accountNumber')
      expect(a).toHaveProperty('accountName')
    }
  })
})
