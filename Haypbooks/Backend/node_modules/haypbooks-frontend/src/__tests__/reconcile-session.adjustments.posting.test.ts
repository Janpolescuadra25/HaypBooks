import { seedIfNeeded, db } from '@/mock/db'

function makeReq(url: string, init?: RequestInit) { return new Request(url, init) }

describe('Reconcile session adjustments posting', () => {
  beforeEach(() => { (db as any).seeded = false; db.accounts.length = 0; (db.journalEntries ||= []).length = 0; (db.reconcileSessions ||= []).length = 0; db.transactions.length = 0; seedIfNeeded() })

  test('posts service charge (DR 6050, CR bank) and interest earned (DR bank, CR 4100) on periodEnd', async () => {
    // Arrange: pick Cash (1000) account as bank
    const cash = db.accounts.find(a => a.number === '1000')!
    // Act: create session via mock helper path (API route uses same function)
    const { createReconcileSession } = await import('@/mock/db')
    const sess = createReconcileSession({
      accountId: cash.id,
      periodEnd: '2025-01-31',
      endingBalance: 1000,
      beginningBalance: 0,
      serviceCharge: 25,
      interestEarned: 10,
      clearedIds: [],
    })
    expect(sess).toBeTruthy()
    // Assert: find two journals on 2025-01-31
    const byDate = (db.journalEntries || []).filter(j => (j.date || '').slice(0,10) === '2025-01-31')
    expect(byDate.length).toBeGreaterThanOrEqual(2)
    // Check lines aggregate
    const findAccount = (num: string) => db.accounts.find(a => a.number === num)!
    const acc6050 = findAccount('6050').id
    const acc4100 = findAccount('4100').id
    const bankId = cash.id
    const hasService = byDate.some(j => j.lines.some(l => l.accountId === acc6050 && l.debit === 25) && j.lines.some(l => l.accountId === bankId && l.credit === 25))
    const hasInterest = byDate.some(j => j.lines.some(l => l.accountId === bankId && l.debit === 10) && j.lines.some(l => l.accountId === acc4100 && l.credit === 10))
    expect(hasService).toBe(true)
    expect(hasInterest).toBe(true)
  })
})
