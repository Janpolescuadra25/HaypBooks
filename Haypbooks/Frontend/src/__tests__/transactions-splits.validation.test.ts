import { db, createTransaction, updateTransaction, closePeriod, reopenPeriod } from '@/mock/db'

describe('Transactions: splits validation and closed-period enforcement', () => {
  beforeEach(() => {
    // Ensure open books for each test unless explicitly closed
    reopenPeriod()
  })

  test('rejects when splits do not sum to transaction amount', () => {
    const acct = db.accounts[0]
    const acc1 = db.accounts[1] || acct
    const acc2 = db.accounts[2] || acct
    const txn = createTransaction({
      date: '2025-05-12',
      description: 'Office supplies',
      category: 'Expense',
      amount: 100,
      accountId: acct.id,
      bankStatus: 'for_review',
      source: 'manual',
    } as any)
    expect(() => updateTransaction({
      id: txn.id,
      date: txn.date,
      description: txn.description,
      category: txn.category,
      amount: txn.amount,
      accountId: txn.accountId,
      bankStatus: 'for_review',
      splits: [
        { accountId: acc1.id, amount: 60 },
        { accountId: acc2.id, amount: 30 }, // totals 90, should reject
      ],
    } as any)).toThrow(/splits must sum/i)
  })

  test('accepts when splits sum equals amount', () => {
    const acct = db.accounts[0]
    const acc1 = db.accounts[1] || acct
    const acc2 = db.accounts[2] || acct
    const txn = createTransaction({
      date: '2025-05-12',
      description: 'Software subscription',
      category: 'Expense',
      amount: 100,
      accountId: acct.id,
      bankStatus: 'for_review',
      source: 'manual',
    } as any)
    const updated = updateTransaction({
      id: txn.id,
      date: txn.date,
      description: txn.description,
      category: txn.category,
      amount: txn.amount,
      accountId: txn.accountId,
      bankStatus: 'categorized',
      splits: [
        { accountId: acc1.id, amount: 60 },
        { accountId: acc2.id, amount: 40 }, // totals 100
      ],
    } as any)
    expect(updated.splits).toBeTruthy()
    expect(Array.isArray((updated as any).splits)).toBe(true)
    expect((updated as any).splits.length).toBe(2)
    const total = Number((updated as any).splits.reduce((s: number, l: any) => s + (Number(l.amount)||0), 0).toFixed(2))
    expect(total).toBe(100)
  })

  test('blocks updates in closed period', () => {
    const acct = db.accounts[0]
    const txn = createTransaction({
      date: '2025-04-10',
      description: 'Fuel',
      category: 'Expense',
      amount: 25,
      accountId: acct.id,
      bankStatus: 'for_review',
      source: 'manual',
    } as any)
    // Close up to and including the transaction date
    closePeriod('2025-04-10')
    expect(() => updateTransaction({
      id: txn.id,
      date: '2025-04-10',
      description: 'Fuel - updated memo',
      category: txn.category,
      amount: txn.amount,
      accountId: txn.accountId,
      bankStatus: 'for_review',
    } as any)).toThrow(/closed period|date is in closed/i)
  })
})
