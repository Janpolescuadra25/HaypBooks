import { createReconcileSession, db, seedIfNeeded } from '@/mock/db'

describe('Reconciliation math invariants', () => {
  beforeEach(() => {
    if (!db.seeded) seedIfNeeded()
  })

  function newTempAccount(num = '1999', name = 'Temp Cash'): string {
    const id = `acc_test_${Math.random().toString(36).slice(2,8)}`
    ;(db.accounts as any).push({ id, number: num + Math.floor(Math.random()*1000), name, type: 'Asset', balance: 0, active: true, reconcilable: true })
    return id
  }

  test('beginning balance must match last ending balance', () => {
  const accId = newTempAccount()
    // First session: beginning=0, ending=0, no cleared
    createReconcileSession({ accountId: accId, periodEnd: '2025-01-31', endingBalance: 0, beginningBalance: 0, clearedIds: [] })
    // Next session: attempt a mismatched beginning balance
    expect(() => createReconcileSession({ accountId: accId, periodEnd: '2025-02-28', endingBalance: 0, beginningBalance: 10, clearedIds: [] }))
      .toThrow(/Beginning balance must match/i)
  })

  test('difference must be zero to finish', () => {
  const accId = newTempAccount()
    // Use a fresh account-like scenario by relying on input beginning for first-time reconciliations
    expect(() => createReconcileSession({ accountId: accId, periodEnd: '2026-01-31', endingBalance: 9, beginningBalance: 10, clearedIds: [] }))
      .toThrow(/Difference must be zero/i)
  })

  test('period end must move forward after last reconciliation', () => {
  const accId = newTempAccount()
    createReconcileSession({ accountId: accId, periodEnd: '2026-02-29', endingBalance: 0, beginningBalance: 0, clearedIds: [] })
    expect(() => createReconcileSession({ accountId: accId, periodEnd: '2026-02-15', endingBalance: 0, beginningBalance: 0, clearedIds: [] }))
      .toThrow(/Period end must be after/i)
  })
})
