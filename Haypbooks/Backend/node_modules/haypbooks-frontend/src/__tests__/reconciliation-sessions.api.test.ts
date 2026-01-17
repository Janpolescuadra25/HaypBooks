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
    // pick some transactions for the account that are dated on or before the period end and not excluded
    let txns = db.transactions.filter(t => t.accountId === acct.id && String(t.date || '').slice(0,10) <= '2025-01-31' && t.bankStatus !== 'excluded').slice(0, 3)
    // If none found (edge cases), create a simple transaction to reconcile
    if (!txns || txns.length === 0) {
      const id = `txn_recon_${Math.random().toString(36).slice(2,8)}`
      db.transactions.push({ id, date: '2025-01-10', description: 'Recon seed', category: 'Income', amount: 100, accountId: acct.id, bankStatus: 'for_review', source: 'manual', tags: [] })
      txns = db.transactions.filter(t => t.accountId === acct.id && String(t.date || '').slice(0,10) <= '2025-01-31' && t.bankStatus !== 'excluded').slice(0, 3)
    }
    const clearedIds = txns.map(t => t.id)
    const endingBalance = Number(txns.reduce((s: number, t: any) => s + Number(t.amount || 0), 0).toFixed(2))
    const payload = {
      accountId: acct.id,
      periodEnd: '2025-01-31',
      endingBalance,
      clearedIds,
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
    const periodEnd = '2025-02-28'
    let txns = db.transactions.filter(t => t.accountId === acct.id && String(t.date || '').slice(0,10) <= periodEnd && t.bankStatus !== 'excluded').slice(0, 2)
    if (!txns || txns.length === 0) {
      const id = `txn_recon_${Math.random().toString(36).slice(2,8)}`
      db.transactions.push({ id, date: '2025-01-10', description: 'Recon seed', category: 'Income', amount: 100, accountId: acct.id, bankStatus: 'for_review', source: 'manual', tags: [] })
      txns = db.transactions.filter(t => t.accountId === acct.id && String(t.date || '').slice(0,10) <= periodEnd && t.bankStatus !== 'excluded').slice(0, 2)
    }
    const prior = (db.reconcileSessions || []).filter(s => s.accountId === acct.id).slice().sort((a,b) => (b.periodEnd || '').localeCompare(a.periodEnd || '') || (b.createdAt || '').localeCompare(a.createdAt || ''))[0]
    const priorEnd = Number(prior?.endingBalance || 0)
    const sumAmounts = Number(txns.reduce((s:number,t:any)=> s + Number(t.amount||0),0).toFixed(2))
    const payload = { accountId: acct.id, periodEnd, endingBalance: Number((priorEnd + sumAmounts).toFixed(2)), clearedIds: txns.map(t => t.id) }
    const create: any = await SESS_POST(makeReq('http://localhost/api/reconciliation/sessions', { method: 'POST', body: JSON.stringify(payload) }))
    if (create.status !== 201) { const errBody = await create.json().catch(()=>null); console.error('CREATE FAILED', create.status, errBody) }
    expect(create.status).toBe(201)
    const created = await create.json()
    expect(created?.session).toBeDefined()
    const session = created.session
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
