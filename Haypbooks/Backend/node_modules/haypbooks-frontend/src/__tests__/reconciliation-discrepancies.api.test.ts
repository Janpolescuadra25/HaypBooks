import { setRoleOverride } from '@/lib/rbac-server'

function makeReq(url: string): Request { return new Request(url) }
function makePost(url: string, body: any): Request { return new Request(url, { method: 'POST', body: JSON.stringify(body) }) }

describe('Reconciliation discrepancies API', () => {
  beforeEach(() => { jest.resetModules(); setRoleOverride('admin' as any) })
  afterEach(() => { setRoleOverride(undefined as any) })

  it('returns changed amount and audit metadata after mutation', async () => {
    const { db, seedIfNeeded } = await import('@/mock/db')
    seedIfNeeded()
    // Pick a reconcilable account and a couple of early cleared txns
    const cash = db.accounts.find(a => a.number === '1000')!
    const txns = db.transactions.filter(t => t.accountId === cash.id && t.cleared).slice(0, 3)
    expect(txns.length).toBeGreaterThanOrEqual(2)
    const clearedIds = txns.map(t => t.id)

    // Create a reconciliation session with zero difference (use beginning=0, ending = sum amounts)
    const sum = clearedIds.reduce((s, id) => s + Number(db.transactions.find(t => t.id === id)!.amount || 0), 0)
    const periodEnd = (db.transactions.find(t => t.id === clearedIds[clearedIds.length - 1])!.date || new Date().toISOString()).slice(0,10)
    const { POST: CreateSession } = await import('@/app/api/reconciliation/sessions/route')
    const req = makePost('http://test/api/reconciliation/sessions', { accountId: cash.id, periodEnd, endingBalance: sum, beginningBalance: 0, clearedIds })
  const res = await CreateSession(req)
  expect(res.status).toBe(201)
    const payload: any = await res.json()
    const sessionId: string = payload?.session?.id
    expect(sessionId).toBeTruthy()

    // Mutate one of the reconciled transactions: change amount slightly
    const targetId = clearedIds[0]
    const txn = db.transactions.find(t => t.id === targetId)!
    const { PUT: UpdateTxn } = await import('@/app/api/transactions/route')
    // Attempting to change reconciled txn amount should be blocked; instead unreconcile then change
    const { POST: Unreconcile } = await import('@/app/api/reconciliation/unreconcile/route')
    let ur = await Unreconcile(makePost('http://test/api/reconciliation/unreconcile', { txnId: targetId, accountId: cash.id }))
    expect(ur.status).toBe(200)
    const newAmt = Number(txn.amount || 0) + 1
    const putReq = new Request('http://test/api/transactions', { method: 'PUT', body: JSON.stringify({ ...txn, amount: newAmt }) })
    const putRes = await UpdateTxn(putReq)
    expect(putRes.status).toBe(200)

    // Now call discrepancies for the account (latest session)
    const { GET: DiscrepanciesGET } = await import('@/app/api/reconciliation/discrepancies/route')
    const dRes = await DiscrepanciesGET(makeReq(`http://test/api/reconciliation/discrepancies?accountId=${encodeURIComponent(cash.id)}`))
    expect(dRes.status).toBe(200)
    const dJson: any = await dRes.json()
    const rows = dJson?.discrepancies || []
    // We expect to see the changed or unreconciled entry for targetId, including audit metadata
    const row = rows.find((r: any) => r.id === targetId)
    expect(row).toBeTruthy()
    expect(['changed','unreconciled','missing']).toContain(row.status)
    // If unreconciled vs changed depends on ordering of operations; assert one of the change types present
    expect(['amount_changed','unreconciled','deleted','changed','date_changed']).toContain(row.changeType)
    // Audit metadata should be present for the unreconcile or update
    expect(row.actor).toBeTruthy()
    expect(row.action).toBeTruthy()
    expect(row.at).toBeTruthy()
  })
})
