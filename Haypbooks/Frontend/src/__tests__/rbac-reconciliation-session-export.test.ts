describe('RBAC: Reconciliation session CSV export', () => {

  it('denies when lacking reports:read', async () => {
    jest.resetModules()
    jest.doMock('@/lib/rbac-server', () => ({ getRoleFromCookies: () => 'guest', hasPermission: () => false }))
    const { GET } = await import('@/app/api/reconciliation/sessions/[id]/export/route')
    const { db, createReconcileSession } = await import('@/mock/db')
    // Seed after importing route (shared module instance)
    db.accounts = [ { id: 'acc_1000', number: '1000', name: 'Cash', type: 'Asset' } as any ]
    db.transactions = [ { id: 't1', date: '2025-01-05T00:00:00.000Z', description: 'Deposit', amount: 100, accountId: 'acc_1000' } as any ]
    db.reconcileSessions = [] as any
    createReconcileSession({ accountId: 'acc_1000', periodEnd: '2025-01-31', endingBalance: 100, beginningBalance: 0, clearedIds: ['t1'] })
    const sessId = db.reconcileSessions![0].id
    const res: any = await GET(new Request(`http://test/api/reconciliation/sessions/${sessId}/export`), { params: { id: sessId } } as any)
    expect(res.status).toBe(403)
    const text = await res.text()
    expect(text).toBe('Forbidden')
    jest.dontMock('@/lib/rbac-server')
  })

  it('allows export with reports:read', async () => {
    jest.resetModules()
    jest.doMock('@/lib/rbac-server', () => ({ getRoleFromCookies: () => 'admin', hasPermission: () => true }))
    const { GET } = await import('@/app/api/reconciliation/sessions/[id]/export/route')
    const { db, createReconcileSession } = await import('@/mock/db')
    db.accounts = [ { id: 'acc_1000', number: '1000', name: 'Cash', type: 'Asset' } as any ]
    db.transactions = [ { id: 't1', date: '2025-01-05T00:00:00.000Z', description: 'Deposit', amount: 100, accountId: 'acc_1000' } as any ]
    db.reconcileSessions = [] as any
    createReconcileSession({ accountId: 'acc_1000', periodEnd: '2025-01-31', endingBalance: 100, beginningBalance: 0, clearedIds: ['t1'] })
    const sessId = db.reconcileSessions![0].id
    const res: any = await GET(new Request(`http://test/api/reconciliation/sessions/${sessId}/export`), { params: { id: sessId } } as any)
    expect(res.status).toBe(200)
    jest.dontMock('@/lib/rbac-server')
  })
})
