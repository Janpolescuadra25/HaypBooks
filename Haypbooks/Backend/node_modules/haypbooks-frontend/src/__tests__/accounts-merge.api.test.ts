/**
 * Tests for the Account Merge API: /api/accounts/merge
 */
import type { NextResponse } from 'next/server'

const mkReq = (body: any) => new Request('http://localhost/api/accounts/merge', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(body),
})

describe('Account Merge API', () => {
  beforeEach(() => {
    jest.resetModules()
  })

  test('happy path: rewrites references and inactivates source', async () => {
    // Allow write
    jest.doMock('@/lib/rbac-server', () => ({ getRoleFromCookies: () => 'admin', hasPermission: () => true }))
  const { POST: ACC_POST } = await import('@/app/api/accounts/route')
  const { POST } = await import('@/app/api/accounts/merge/route')
  const { db, createTransaction, createReconcileSession } = await import('@/mock/db')

    // Create source/target accounts of same type (Expense)
    const srcRes: any = await ACC_POST(new Request('http://localhost/api/accounts', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ number: '7777', name: 'Temp Expense A', type: 'Expense' }) }))
    const tgtRes: any = await ACC_POST(new Request('http://localhost/api/accounts', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ number: '7778', name: 'Temp Expense B', type: 'Expense' }) }))
    expect(srcRes.status).toBe(200)
    expect(tgtRes.status).toBe(200)
    const src = (await srcRes.json()).account
    const tgt = (await tgtRes.json()).account

    // Add a transaction referencing source
    createTransaction({ date: new Date().toISOString(), description: 'Tmp', category: 'Expense', amount: -25, accountId: src.id, bankStatus: 'for_review', source: 'manual' })
    // Add a journal entry line referencing source (minimal shape)
    ;(db.journalEntries || (db.journalEntries = [])).push({ id: 'je_tmp', date: new Date().toISOString(), lines: [{ accountId: src.id, debit: 0, credit: 0 }] } as any)
    // Add a reconcile session referencing source
    createReconcileSession({ accountId: src.id, periodEnd: new Date().toISOString().slice(0,10), endingBalance: 0, clearedIds: [] })

    const res: any = await POST(mkReq({ sourceId: src.id, targetId: tgt.id, strategy: 'inactivate' }))
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.ok).toBe(true)
    // Summary counts should reflect our 1 txn, 1 journal line, 0 items, 1 reconcile session
    expect(body.summary.txns).toBeGreaterThanOrEqual(1)
    expect(body.summary.journalLines).toBeGreaterThanOrEqual(1)
    expect(body.summary.reconcileSessions).toBeGreaterThanOrEqual(1)

    // All references moved to target
  expect(db.transactions.some(t => t.accountId === src.id)).toBe(false)
  expect(db.transactions.some(t => t.accountId === tgt.id)).toBe(true)
  expect((db.journalEntries || []).some(j => j.lines.some(l => l.accountId === src.id))).toBe(false)
  expect((db.reconcileSessions || []).some(r => r.accountId === src.id)).toBe(false)

    // Source now inactive and name annotated
    const srcAcc = db.accounts.find(a => a.id === src.id) as any
    expect(srcAcc?.active).toBe(false)
    expect(String(srcAcc?.name)).toMatch(/\(merged\)/i)
  })

  test('guard: accounts must be same type', async () => {
    jest.doMock('@/lib/rbac-server', () => ({ getRoleFromCookies: () => 'admin', hasPermission: () => true }))
    const { POST: ACC_POST } = await import('@/app/api/accounts/route')
    const { POST } = await import('@/app/api/accounts/merge/route')
    const a1: any = await ACC_POST(new Request('http://localhost/api/accounts', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ number: '8888', name: 'Tmp Income', type: 'Income' }) }))
    const a2: any = await ACC_POST(new Request('http://localhost/api/accounts', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ number: '8889', name: 'Tmp Expense', type: 'Expense' }) }))
    const src = (await a1.json()).account
    const tgt = (await a2.json()).account
    const res: any = await POST(mkReq({ sourceId: src.id, targetId: tgt.id }))
    expect(res.status).toBe(400)
    const j = await res.json()
    expect(j.error).toMatch(/same type/i)
  })

  test('guard: target must be active', async () => {
    jest.doMock('@/lib/rbac-server', () => ({ getRoleFromCookies: () => 'admin', hasPermission: () => true }))
    const { POST: ACC_POST, PUT: ACC_PUT } = await import('@/app/api/accounts/route')
    const { POST } = await import('@/app/api/accounts/merge/route')
    const a1: any = await ACC_POST(new Request('http://localhost/api/accounts', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ number: '8890', name: 'Tmp Exp 1', type: 'Expense' }) }))
    const a2: any = await ACC_POST(new Request('http://localhost/api/accounts', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ number: '8891', name: 'Tmp Exp 2', type: 'Expense' }) }))
    const src = (await a1.json()).account
    const tgt = (await a2.json()).account
    const inact: any = await ACC_PUT(new Request('http://localhost/api/accounts', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: tgt.id, active: false }) }))
    expect(inact.status).toBe(200)
    const res: any = await POST(mkReq({ sourceId: src.id, targetId: tgt.id }))
    expect(res.status).toBe(400)
    const j = await res.json()
    expect(j.error).toMatch(/Target account must be active/i)
  })

  test('guard: cannot merge from protected system account', async () => {
    jest.doMock('@/lib/rbac-server', () => ({ getRoleFromCookies: () => 'admin', hasPermission: () => true }))
    const { POST } = await import('@/app/api/accounts/merge/route')
    // Find protected Cash (1000) and merge into A/R (1100) just to trigger guard
    const { db } = await import('@/mock/db')
    const cash = db.accounts.find((a: any) => a.number === '1000')!
    const ar = db.accounts.find((a: any) => a.number === '1100')!
    const res: any = await POST(mkReq({ sourceId: cash.id, targetId: ar.id }))
    expect(res.status).toBe(400)
    const j = await res.json()
    expect(j.error).toMatch(/protected/i)
  })

  test('strategy delete: removes source when no references remain', async () => {
    jest.doMock('@/lib/rbac-server', () => ({ getRoleFromCookies: () => 'admin', hasPermission: () => true }))
    const { POST: ACC_POST } = await import('@/app/api/accounts/route')
    const { POST } = await import('@/app/api/accounts/merge/route')
    const { db } = await import('@/mock/db')
    const a1: any = await ACC_POST(new Request('http://localhost/api/accounts', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ number: '8892', name: 'Del Src', type: 'Expense' }) }))
    const a2: any = await ACC_POST(new Request('http://localhost/api/accounts', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ number: '8893', name: 'Del Tgt', type: 'Expense' }) }))
    const src = (await a1.json()).account
    const tgt = (await a2.json()).account
    // Ensure no references to src exist
    expect(db.transactions.some(t => t.accountId === src.id)).toBe(false)
    const res: any = await POST(mkReq({ sourceId: src.id, targetId: tgt.id, strategy: 'delete' }))
    expect(res.status).toBe(200)
    // Source removed
    expect(db.accounts.find(a => a.id === src.id)).toBeUndefined()
  })

  test('RBAC: viewer cannot merge (403)', async () => {
    jest.doMock('@/lib/rbac-server', () => ({ getRoleFromCookies: () => 'viewer', hasPermission: () => false }))
    const { POST } = await import('@/app/api/accounts/merge/route')
    const res: any = await POST(mkReq({ sourceId: 'a', targetId: 'b' }))
    expect(res.status).toBe(403)
  })
})
