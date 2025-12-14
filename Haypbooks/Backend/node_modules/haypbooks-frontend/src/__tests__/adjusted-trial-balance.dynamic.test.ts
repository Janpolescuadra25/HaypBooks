import { seedIfNeeded } from '@/mock/db'
import { computeAdjustedTrialBalance } from '@/mock/aggregations'
import { createAdjustingJournal, db } from '@/mock/db'

// Helper to find row by account number
function findRow(rows: any[], number: string) {
  return rows.find(r => r.number === number)
}

describe('Adjusted Trial Balance dynamic computation', () => {
  beforeAll(() => {
    seedIfNeeded()
  })

  test('adjusting journal impacts adjusted columns and final totals balance', () => {
    const before = computeAdjustedTrialBalance({})
    // Ensure we have some unadjusted rows to start with (seed posts invoices/bills)
    expect(before.rows.length).toBeGreaterThan(0)
    const preExp = findRow(before.rows, '6000')
    const preAP = findRow(before.rows, '2000')

    // Create adjusting journal: Dr Operating Expenses (6000) 500, Cr Accounts Payable (2000) 500
    const date = '2025-01-31'
    createAdjustingJournal({ date, lines: [
      { accountNumber: '6000', debit: 500 },
      { accountNumber: '2000', credit: 500 },
    ], reversing: false })

    const after = computeAdjustedTrialBalance({})
    const postExp = findRow(after.rows, '6000')
    const postAP = findRow(after.rows, '2000')

    expect(postExp).toBeDefined()
    expect(postAP).toBeDefined()
    // Adjusted debit for 6000 increased by 500
    const diffAdjExp = (postExp.adjDebit - (preExp?.adjDebit || 0))
    expect(diffAdjExp).toBe(500)
    // Adjusted credit for 2000 increased by 500
    const diffAdjAP = (postAP.adjCredit - (preAP?.adjCredit || 0))
    expect(diffAdjAP).toBe(500)

    // Final totals should still balance
    expect(after.totals.finalDebit).toBe(after.totals.finalCredit)
    expect(after.balanced).toBe(true)
  })
})
