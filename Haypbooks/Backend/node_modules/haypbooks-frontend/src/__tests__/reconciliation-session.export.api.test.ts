import { GET as DetailGET } from '@/app/api/reconciliation/sessions/[id]/route'
import { GET as ExportGET } from '@/app/api/reconciliation/sessions/[id]/export/route'
import { db, createReconcileSession } from '@/mock/db'

const makeReq = (url: string) => new Request(url)

describe('Reconciliation session export API', () => {
  beforeEach(() => {
    // Reset minimal slices used in this test
    db.accounts = [] as any
    db.transactions = [] as any
    db.reconcileSessions = [] as any
    db.journalEntries = [] as any
    // Seed minimal data: account, transactions, and a session
    db.accounts = [ { id: 'acc_1000', number: '1000', name: 'Cash', type: 'Asset' } as any ]
    const today = '2025-01-31'
    // Seed some transactions
    db.transactions = [
      { id: 't1', date: '2025-01-05T00:00:00.000Z', description: 'Deposit', amount: 100, accountId: 'acc_1000', type: 'bank' } as any,
      { id: 't2', date: '2025-01-06T00:00:00.000Z', description: 'Withdrawal', amount: -30, accountId: 'acc_1000', type: 'bank' } as any,
    ]
    // Create a finished session with both cleared
    createReconcileSession({ accountId: 'acc_1000', periodEnd: today, endingBalance: 70, beginningBalance: 0, clearedIds: ['t1','t2'] })
  })

  it('delegates to JSON detail and builds CSV with caption and headers', async () => {
    const sessId = db.reconcileSessions![0].id
    const jsonRes: any = await DetailGET(makeReq(`http://test/api/reconciliation/sessions/${sessId}`), { params: { id: sessId } } as any)
    expect(jsonRes.status).toBe(200)

    const csvRes: any = await ExportGET(makeReq(`http://test/api/reconciliation/sessions/${sessId}/export`), { params: { id: sessId } } as any)
    expect(csvRes.status).toBe(200)
    const text = await csvRes.text()
    const lines = text.split('\n')
    expect(lines[0]).toMatch(/As of/i)
    expect(lines[1]).toBe('')
    expect(lines[2]).toBe('Date,Description,Amount,Cleared')
  })

  it('includes CSV-Version prelude when opted in and builds filename with acc token', async () => {
    const sessId = db.reconcileSessions![0].id
    const csvRes: any = await ExportGET(makeReq(`http://test/api/reconciliation/sessions/${sessId}/export?csv=latest`), { params: { id: sessId } } as any)
    expect(csvRes.status).toBe(200)
    const text = await csvRes.text()
  const lines = text.split('\n')
  expect(lines[0]).toBe('CSV-Version,1')
  expect(lines[1]).toMatch(/As of/i)

    const disp = csvRes.headers.get('Content-Disposition') || ''
    expect(disp).toMatch(/filename="reconciliation-session.*acc-1000.*\.csv"/)
  })
})
