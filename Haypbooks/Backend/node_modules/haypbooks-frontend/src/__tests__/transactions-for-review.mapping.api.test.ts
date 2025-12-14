import { seedIfNeeded, db } from '@/mock/db'
import { GET as getTransactions } from '@/app/api/transactions/route'

function makeReq(url: string) { return new Request(url) }

describe('Transactions API: for_review mapping includes imported', () => {
  beforeAll(() => { seedIfNeeded() })

  test('GET /api/transactions?bankStatus=for_review returns imported and for_review', async () => {
    // Count expected items directly from db: for_review ∪ imported ∪ unset
    const expected = db.transactions.filter(t => (t.bankStatus || 'for_review') === 'for_review' || t.bankStatus === 'imported')
    expect(expected.length).toBeGreaterThan(0)

    const req = makeReq('http://localhost/api/transactions?bankStatus=for_review&page=1&limit=5000')
    const res: any = await getTransactions(req as any)
    expect(res.status).toBe(200)
    const json = await res.json()
    const rows = json.transactions
    const total = json.total

    // Should include at least one imported item in rows
    const hasImportedInRows = rows.some((t: any) => t.bankStatus === 'imported')
    expect(hasImportedInRows).toBe(true)

    // Total should match our expected set size
    expect(total).toBe(expected.length)

    // No rows with bankStatus strictly categorized/excluded should be present
    const anyWrong = rows.some((t: any) => t.bankStatus === 'categorized' || t.bankStatus === 'excluded')
    expect(anyWrong).toBe(false)
  })
})
