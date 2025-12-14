import { db, seedIfNeeded } from '@/mock/db'

const makeReq = (body: any) => new Request('http://test/api/reconciliation/toggle-cleared', { method: 'POST', body: JSON.stringify(body) })

describe('Reconciliation toggle-cleared API scoping', () => {
  beforeEach(() => {
    db.accounts = [] as any
    db.transactions = [] as any
    db.reconcileSessions = [] as any
    db.journalEntries = [] as any
    seedIfNeeded()
    // Prune seed; ensure a predictable account and txn
    db.accounts = [{ id: 'accA', number: '1000', name: 'Cash', type: 'Asset' } as any]
    db.transactions = [
      { id: 'ta', date: '2025-01-10T00:00:00.000Z', description: 'Deposit', amount: 100, accountId: 'accA', type: 'bank' } as any,
      { id: 'tb', date: '2025-02-01T00:00:00.000Z', description: 'Deposit', amount: 50, accountId: 'accA', type: 'bank' } as any,
      { id: 'tc', date: '2025-01-15T00:00:00.000Z', description: 'Other account', amount: 25, accountId: 'accB', type: 'bank' } as any,
    ]
  })

  it('denies without journal:write', async () => {
    jest.doMock('@/lib/rbac-server', () => ({ getRoleFromCookies: () => 'viewer', hasPermission: (_: any, p: string) => p === 'reports:read' }))
    const { POST } = await import('@/app/api/reconciliation/toggle-cleared/route')
    const res: any = await POST(makeReq({ id: 'ta', cleared: true, accountId: 'accA', periodEnd: '2025-01-31' }))
    expect(res.status).toBe(403)
  })

  it('validates accountId presence and ownership and periodEnd date', async () => {
    jest.resetModules()
    jest.doMock('@/lib/rbac-server', () => ({ getRoleFromCookies: () => 'admin', hasPermission: () => true }))
    const { db } = await import('@/mock/db')
    // Prepare controlled state for this module instance of the DB before importing the route
    db.accounts = [{ id: 'accA', number: '1000', name: 'Cash', type: 'Asset' } as any]
    db.transactions = [
      { id: 'ta', date: '2025-01-10T00:00:00.000Z', description: 'Deposit', amount: 100, accountId: 'accA', type: 'bank' } as any,
      { id: 'tb', date: '2025-02-01T00:00:00.000Z', description: 'Deposit', amount: 50, accountId: 'accA', type: 'bank' } as any,
    ]
    const { POST } = await import('@/app/api/reconciliation/toggle-cleared/route')

    // Missing accountId
    let res: any = await POST(makeReq({ id: 'ta', cleared: true }))
    expect(res.status).toBe(400)

    // Wrong account
    res = await POST(makeReq({ id: 'ta', cleared: true, accountId: 'accWRONG', periodEnd: '2025-01-31' }))
    expect(res.status).toBe(400)

    // Date after periodEnd
    res = await POST(makeReq({ id: 'tb', cleared: true, accountId: 'accA', periodEnd: '2025-01-31' }))
    expect(res.status).toBe(400)

    // Success
    res = await POST(makeReq({ id: 'ta', cleared: true, accountId: 'accA', periodEnd: '2025-01-31' }))
    expect(res.status).toBe(200)
    const t = db.transactions.find(tr => tr.id === 'ta') as any
    expect(Boolean(t.cleared)).toBe(true)
  })
})
