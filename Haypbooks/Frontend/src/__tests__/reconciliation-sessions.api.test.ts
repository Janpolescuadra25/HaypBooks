import { GET as SESS_GET, POST as SESS_POST } from '@/app/api/reconciliation/sessions/route'
import { DELETE as SESS_DELETE } from '@/app/api/reconciliation/sessions/[id]/route'
import { db, seedIfNeeded } from '@/mock/db'

const makeReq = (url: string, init?: RequestInit) => new Request(url, init)

describe('Reconciliation sessions API', () => {
  beforeEach(() => {
    // Ensure a clean seeded DB for each test run
    if (!db.seeded) seedIfNeeded()
  })

  test('GET returns sessions list (optionally filtered by account)', async () => {
    const res: any = await SESS_GET(makeReq('http://localhost/api/reconciliation/sessions'))
    expect(res.status).toBe(200)
    const data = await res.json()
    expect(Array.isArray(data.sessions)).toBe(true)

    // With accountId filter
    const acct = db.accounts[0]
    const res2: any = await SESS_GET(makeReq(`http://localhost/api/reconciliation/sessions?accountId=${acct.id}`))
    expect(res2.status).toBe(200)
    const data2 = await res2.json()
    expect(Array.isArray(data2.sessions)).toBe(true)
  })

  test('POST creates a session and marks transactions reconciled', async () => {
    const acct = db.accounts[0]
    const txns = db.transactions.filter(t => t.accountId === acct.id).slice(0, 3)
    const payload = {
      accountId: acct.id,
      periodEnd: '2025-01-31',
      endingBalance: 1000,
      clearedIds: txns.map(t => t.id),
    }
    const res: any = await SESS_POST(makeReq('http://localhost/api/reconciliation/sessions', { method: 'POST', body: JSON.stringify(payload) }))
    expect(res.status).toBe(201)
    const { session } = await res.json()
    expect(session).toBeDefined()
    expect(session.accountId).toBe(acct.id)
    expect(session.clearedIds).toEqual(payload.clearedIds)
    // Transactions should be flagged reconciled
    for (const id of payload.clearedIds) {
      const t = db.transactions.find(x => x.id === id)!
      expect(t.reconciled).toBe(true)
      expect(typeof t.reconciledAt).toBe('string')
    }
  })

  test('DELETE undoes a session and unreconciles affected transactions', async () => {
    const acct = db.accounts[0]
    const txns = db.transactions.filter(t => t.accountId === acct.id).slice(0, 2)
    const payload = { accountId: acct.id, periodEnd: '2025-01-31', endingBalance: 500, clearedIds: txns.map(t => t.id) }
    const create: any = await SESS_POST(makeReq('http://localhost/api/reconciliation/sessions', { method: 'POST', body: JSON.stringify(payload) }))
    const { session } = await create.json()
    // Ensure reconciled
    for (const id of payload.clearedIds) expect(db.transactions.find(x => x.id === id)?.reconciled).toBe(true)

    const del: any = await SESS_DELETE(makeReq('http://localhost/api/reconciliation/sessions/'+session.id), { params: { id: session.id } } as any)
    expect(del.status).toBe(200)
    const data = await del.json()
    expect(data.ok).toBe(true)
    // Flags removed
    for (const id of payload.clearedIds) {
      const t = db.transactions.find(x => x.id === id)!
      expect(t.reconciled).toBe(false)
      expect(t.reconciledAt).toBeUndefined()
    }
  })

  test('RBAC: denied when journal permission missing', async () => {
    jest.resetModules()
    jest.doMock('@/lib/rbac-server', () => ({ getRoleFromCookies: () => 'nope', hasPermission: () => false }))
    const { GET: GET2, POST: POST2 } = await import('@/app/api/reconciliation/sessions/route')
    const { DELETE: DEL2 } = await import('@/app/api/reconciliation/sessions/[id]/route')

    // GET forbidden
    const r1: any = await GET2(makeReq('http://localhost/api/reconciliation/sessions'))
    expect(r1.status).toBe(403)
    // POST forbidden
    const r2: any = await POST2(makeReq('http://localhost/api/reconciliation/sessions', { method: 'POST', body: JSON.stringify({}) }))
    expect(r2.status).toBe(403)
    // DELETE forbidden
    const r3: any = await DEL2(makeReq('http://localhost/api/reconciliation/sessions/abc'), { params: { id: 'abc' } } as any)
    expect(r3.status).toBe(403)
  })
})
