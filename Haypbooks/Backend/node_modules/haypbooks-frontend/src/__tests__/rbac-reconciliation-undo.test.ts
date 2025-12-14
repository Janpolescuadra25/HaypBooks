describe('RBAC: Reconciliation session Undo', () => {
  it('DELETE is forbidden without journal:write', async () => {
    jest.resetModules()
    jest.doMock('@/lib/rbac-server', () => ({ getRoleFromCookies: () => 'viewer', hasPermission: (_r: any, p: string) => p === 'reports:read' }))
    const { db, createReconcileSession } = await import('@/mock/db')
    db.accounts = [] as any
    db.transactions = [] as any
    db.reconcileSessions = [] as any
    db.journalEntries = [] as any
    db.accounts = [{ id: 'acc_1', number: '1000', name: 'Cash', type: 'Asset' } as any]
    db.transactions = [
      { id: 't1', date: '2025-01-05T00:00:00.000Z', description: 'Deposit', amount: 100, accountId: 'acc_1', type: 'bank' } as any,
    ]
    createReconcileSession({ accountId: 'acc_1', periodEnd: '2025-01-31', endingBalance: 100, beginningBalance: 0, clearedIds: ['t1'] })

    const { DELETE } = await import('@/app/api/reconciliation/sessions/[id]/route')
    const id = db.reconcileSessions![0].id
    const res: any = await DELETE(new Request(`http://test/api/reconciliation/sessions/${id}`), { params: { id } } as any)
    expect(res.status).toBe(403)
  })

  it('DELETE succeeds with journal:write', async () => {
    jest.resetModules()
    jest.doMock('@/lib/rbac-server', () => ({ getRoleFromCookies: () => 'admin', hasPermission: () => true }))
    const { db, createReconcileSession } = await import('@/mock/db')
    db.accounts = [] as any
    db.transactions = [] as any
    db.reconcileSessions = [] as any
    db.journalEntries = [] as any
    db.accounts = [{ id: 'acc_1', number: '1000', name: 'Cash', type: 'Asset' } as any]
    db.transactions = [
      { id: 't1', date: '2025-01-05T00:00:00.000Z', description: 'Deposit', amount: 100, accountId: 'acc_1', type: 'bank' } as any,
    ]
    createReconcileSession({ accountId: 'acc_1', periodEnd: '2025-01-31', endingBalance: 100, beginningBalance: 0, clearedIds: ['t1'] })

    const { DELETE } = await import('@/app/api/reconciliation/sessions/[id]/route')
    const id = db.reconcileSessions![0].id
    const res: any = await DELETE(new Request(`http://test/api/reconciliation/sessions/${id}`), { params: { id } } as any)
    expect(res.status).toBe(200)
  })
})
