import { GET as ExportGET } from '@/app/api/reconciliation/sessions/[id]/export/route'
import { db, createReconcileSession } from '@/mock/db'

const makeReq = (url: string) => new Request(url)

describe('Reconciliation session export filename', () => {
  beforeEach(() => {
    // Reset minimal slices used in this test
    db.accounts = [] as any
    db.transactions = [] as any
    db.reconcileSessions = [] as any
    db.journalEntries = [] as any

    // Seed account and activity
    db.accounts = [{ id: 'acc_1000', number: '1000', name: 'Cash', type: 'Asset' } as any]
    const periodEnd = '2025-01-31'
    db.transactions = [
      { id: 't1', date: '2025-01-05T00:00:00.000Z', description: 'Deposit', amount: 100, accountId: 'acc_1000', type: 'bank' } as any,
      { id: 't2', date: '2025-01-06T00:00:00.000Z', description: 'Withdrawal', amount: -30, accountId: 'acc_1000', type: 'bank' } as any,
    ]
    // Create a finished session with both cleared and known ending balance
    createReconcileSession({ accountId: 'acc_1000', periodEnd, endingBalance: 70, beginningBalance: 0, clearedIds: ['t1','t2'] })
  })

  it('includes as-of date and account token', async () => {
    const sessId = db.reconcileSessions![0].id
    const res: any = await ExportGET(makeReq(`http://test/api/reconciliation/sessions/${sessId}/export`), { params: { id: sessId } } as any)
    expect(res.status).toBe(200)
    const disp = res.headers.get('Content-Disposition') || ''
    // Pattern: reconciliation-session-asof-YYYY-MM-DD_acc-<number>.csv
    expect(disp).toMatch(/filename="reconciliation-session-asof-2025-01-31_acc-1000\.csv"/)
  })
})
