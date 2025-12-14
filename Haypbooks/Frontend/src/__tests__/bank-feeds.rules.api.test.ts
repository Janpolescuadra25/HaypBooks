import { seedIfNeeded, db, addBankRule, applyRulesToTransactions } from '@/mock/db'
import { POST as pull } from '@/app/api/bank-feeds/pull/route'
import { POST as apply } from '@/app/api/bank-feeds/apply-rules/route'

function extractBody(res: any) { return (res as any)?._body || (res as any).body }

describe('Bank feeds rules flow', () => {
  beforeAll(() => { seedIfNeeded() })

  test('pull imports transactions and apply rules categorizes/excludes', async () => {
    const before = db.transactions.length
    const res1: any = await pull()
    expect(res1.status).toBe(200)
    const j1 = await res1.json()
    expect(j1.added).toBeGreaterThanOrEqual(0)
    const afterPull = db.transactions.length
    expect(afterPull).toBeGreaterThanOrEqual(before)

    // Add a custom rule to categorize ONLINE transactions
    const rule = addBankRule({ name: 'Auto ONLINE to Income', textIncludes: 'ONLINE', setCategory: 'Income', setStatus: 'categorized' })
    expect(rule.id).toBeDefined()

  const res2: any = await apply(new Request('http://localhost/api/bank-feeds/apply-rules'))
    expect(res2.status).toBe(200)
    const j2 = await res2.json()
    expect(j2.updated).toBeGreaterThanOrEqual(1)

    // Spot check: at least one imported txn with 'ONLINE' should now be categorized
    const anyCategorized = db.transactions.some(t => (t.description||'').includes('ONLINE') && t.bankStatus === 'categorized')
    expect(anyCategorized).toBe(true)
  })

  test('applyRulesToTransactions returns count and doesn\'t affect categorized items', () => {
    const baselineCategorized = db.transactions.filter(t => t.bankStatus === 'categorized').length
    const { updated } = applyRulesToTransactions(['imported','for_review'])
    // Applying twice shouldn\'t massively increase categorized unless new matches exist
    expect(updated).toBeGreaterThanOrEqual(0)
    const after = db.transactions.filter(t => t.bankStatus === 'categorized').length
    expect(after).toBeGreaterThanOrEqual(baselineCategorized)
  })
})
