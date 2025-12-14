import { seedIfNeeded, db } from '../mock/db'
import { GET as reconGet } from '@/app/api/reconciliation/summary/route'

function extractJson(res: any) { return (res as any)?._body || (res as any).body }

describe('Reconciliation summary API', () => {
  beforeAll(() => { seedIfNeeded() })
  test('returns buckets and progress consistent with seeded data', async () => {
    const res: any = await reconGet()
    const json = await res.json()
    expect(json.buckets.length).toBeGreaterThan(0)
    const totalCount = json.buckets.reduce((s: number,b: any)=>s+b.count,0)
    expect(totalCount).toBe(db.transactions.length)
    // progress formula check
    const fr = json.counts.for_review + json.counts.categorized
    if (fr > 0) {
      expect(json.progress).toBe(Math.round((json.counts.categorized / fr) * 100))
    }
  })
})
