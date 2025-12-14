import { GET as UndepositedGET } from '@/app/api/undeposited-payments/route'
import { GET as DepositsGET, POST as DepositsPOST } from '@/app/api/deposits/route'
import { seedIfNeeded, db, createCustomerPayment } from '@/mock/db'
import { setRoleOverride } from '@/lib/rbac-server'

const makeReq = (url: string, init?: RequestInit) => new Request(url, init)

describe('Deposits APIs', () => {
  beforeAll(() => { seedIfNeeded() })
  beforeEach(() => { setRoleOverride('admin' as any) })
  afterEach(() => { setRoleOverride(undefined as any) })

  function createUndepositedForAnyInvoice(count = 1) {
    const targets = db.invoices.filter(i => i.balance > 0)
    const created: { paymentIds: string[]; invoiceId: string }[] = []
    for (let i = 0; i < Math.min(count, targets.length); i++) {
      const inv = targets[i]
      const amt = Math.min(inv.balance, Math.max(50, Math.round(inv.total * 0.25)))
      const cp = createCustomerPayment({ customerId: inv.customerId, amountReceived: amt, allocations: [{ invoiceId: inv.id, amount: amt }], date: '2025-01-10' })
      created.push({ paymentIds: cp.paymentIds.slice(), invoiceId: inv.id })
    }
    return created
  }

  it('lists undeposited payments with read permission', async () => {
    const created = createUndepositedForAnyInvoice(2)
    const res: any = await UndepositedGET()
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(Array.isArray(body.payments)).toBe(true)
    const flattened = created.flatMap(c => c.paymentIds)
    for (const id of flattened) {
      expect(body.payments.some((p: any) => p.id === id)).toBe(true)
    }
  })

  it('creates a deposit with provided date and then lists it', async () => {
    const [{ paymentIds }] = createUndepositedForAnyInvoice(1)
    const date = '2025-01-20'
    const postReq = makeReq('http://localhost/api/deposits', { method: 'POST', body: JSON.stringify({ paymentIds, date }) })
    const postRes: any = await DepositsPOST(postReq as any)
    expect(postRes.status).toBe(200)
    const postBody = await postRes.json()
    expect(postBody.deposit?.id).toBeTruthy()
    expect(postBody.deposit?.date).toBe(date)
    const undepRes: any = await UndepositedGET()
    const undepBody = await undepRes.json()
    for (const id of paymentIds) {
      expect(undepBody.payments.some((p: any) => p.id === id)).toBe(false)
    }
    const listRes: any = await DepositsGET()
    expect(listRes.status).toBe(200)
    const listBody = await listRes.json()
    expect(listBody.total).toBeGreaterThan(0)
    expect(listBody.deposits.some((d: any) => d.date === date && d.paymentCount >= 1)).toBe(true)
  })

  it('creates a deposit to a selected asset account (journal lines)', async () => {
    const [{ paymentIds }] = createUndepositedForAnyInvoice(1)
  const assetAccounts = db.accounts.filter((a: any) => a.type === 'Asset')
  const target = assetAccounts.find((a: any) => a.number !== '1000' && a.number !== '1010') || assetAccounts.find((a: any) => a.number !== '1010') || assetAccounts[0]
    const undep = db.accounts.find((a: any) => a.number === '1010')!
    const postReq = makeReq('http://localhost/api/deposits', { method: 'POST', body: JSON.stringify({ paymentIds, date: '2025-01-21', accountNumber: target.number }) })
    const postRes: any = await DepositsPOST(postReq as any)
    expect(postRes.status).toBe(200)
    const depBody = await postRes.json()
    expect(depBody.deposit.journalEntryId).toBeTruthy()
    const je = db.journalEntries!.find((j: any) => j.id === depBody.deposit.journalEntryId)!
    expect(je).toBeTruthy()
    // Expect DR target asset == total, CR Undeposited Funds (1010) == total
    const dr = je.lines.find((l: any) => l.accountId === target.id)!
    const cr = je.lines.find((l: any) => l.accountId === undep.id)!
    expect(dr.debit).toBeCloseTo(depBody.deposit.total, 5)
    expect(cr.credit).toBeCloseTo(depBody.deposit.total, 5)
  })

  it('persists memo on deposit and journal lines; blocks depositing to 1010', async () => {
    const [{ paymentIds }] = createUndepositedForAnyInvoice(1)
    const memo = 'Branch A cash drop'
    const assetAccounts = db.accounts.filter((a: any) => a.type === 'Asset')
    const target = assetAccounts.find((a: any) => a.number !== '1000' && a.number !== '1010') || assetAccounts.find((a: any) => a.number !== '1010') || assetAccounts[0]
    const postReq = makeReq('http://localhost/api/deposits', { method: 'POST', body: JSON.stringify({ paymentIds, date: '2025-01-22', accountNumber: target.number, memo }) })
    const postRes: any = await DepositsPOST(postReq as any)
    expect(postRes.status).toBe(200)
    const body = await postRes.json()
    expect(body.deposit.memo).toBe(memo)
    const je = db.journalEntries!.find((j: any) => j.id === body.deposit.journalEntryId)!
    expect(je).toBeTruthy()
    // Both lines should include memo text
    expect(je.lines.every((l: any) => typeof l.memo === 'string' && l.memo.includes(memo))).toBe(true)

  // Now try to deposit to 1010 with a fresh undeposited payment (should fail)
  const [{ paymentIds: freshIds }] = createUndepositedForAnyInvoice(1)
  const badReq = makeReq('http://localhost/api/deposits', { method: 'POST', body: JSON.stringify({ paymentIds: freshIds, date: '2025-01-23', accountNumber: '1010' }) })
    const badRes: any = await DepositsPOST(badReq as any)
    expect(badRes.status).toBe(400)
    const badBody = await badRes.json()
    expect(String(badBody.error || '').toLowerCase()).toContain('undeposited')
  })

  it('RBAC: forbids creating deposits without write permission', async () => {
    const [{ paymentIds }] = createUndepositedForAnyInvoice(1)
    setRoleOverride('viewer' as any)
    const postReq = makeReq('http://localhost/api/deposits', { method: 'POST', body: JSON.stringify({ paymentIds }) })
    const postRes: any = await DepositsPOST(postReq as any)
    expect(postRes.status).toBe(403)
    const body = await postRes.json()
    expect((body.error || '').toLowerCase()).toContain('forbidden')
  })

  it('RBAC: allows listing with invoices:read even without reports:read', async () => {
    setRoleOverride('no-reports' as any) // has invoices:read, lacks reports:read
    const res1: any = await UndepositedGET()
    expect(res1.status).toBe(200)
    const res2: any = await DepositsGET()
    expect(res2.status).toBe(200)
  })

  it('deposit detail hydrates payment lines', async () => {
    const { GET: GET_DETAIL } = await import('@/app/api/deposits/[id]/route')
    // Ensure at least one deposit exists
    let listRes: any = await DepositsGET()
    let listBody = await listRes.json()
    if (listBody.total === 0) {
      const inv = db.invoices.find(i => i.status !== 'paid' && i.balance > 0)!
      const remaining = (inv.total - inv.payments.reduce((s,p)=>s+p.amount,0))
      const allocAmt = Math.min(remaining, 12)
      const cp = createCustomerPayment({ customerId: inv.customerId, amountReceived: allocAmt, allocations: [{ invoiceId: inv.id, amount: allocAmt }], date: '2025-01-13' })
      await DepositsPOST(makeReq('http://test/api/deposits', { method: 'POST', body: JSON.stringify({ paymentIds: cp.paymentIds, date: '2025-01-16' }) }) as any)
      listRes = await DepositsGET()
      listBody = await listRes.json()
    }
    const depId = listBody.deposits[0].id
    const resDetail: any = await GET_DETAIL(new Request('http://test/api/deposits/' + depId), { params: { id: depId } } as any)
    expect(resDetail.status).toBe(200)
    const detail = await resDetail.json()
    expect(detail.deposit.id).toBe(depId)
    expect(Array.isArray(detail.deposit.payments)).toBe(true)
    expect(detail.deposit.payments.length).toBeGreaterThan(0)
  })

  it('voids a deposit: reversing JE and payments returned to undeposited', async () => {
    const { DELETE: VoidDELETE } = await import('@/app/api/deposits/[id]/void/route')
    // Create a fresh undeposited payment and deposit it
    const [{ paymentIds }] = createUndepositedForAnyInvoice(1)
    const date = '2025-01-24'
    const postRes: any = await DepositsPOST(makeReq('http://test/api/deposits', { method: 'POST', body: JSON.stringify({ paymentIds, date }) }) as any)
    expect(postRes.status).toBe(200)
    const depBody = await postRes.json()
    const depId = depBody.deposit.id
    // Void the deposit
    const delRes: any = await VoidDELETE(new Request('http://test/api/deposits/'+depId+'/void'), { params: { id: depId } } as any)
    expect(delRes.status).toBe(200)
    const delBody = await delRes.json()
    expect(delBody.deposit.id).toBe(depId)
    // Reversing journal created
    if (delBody.deposit.reversingEntryId) {
      const rev = db.journalEntries!.find((j: any) => j.id === delBody.deposit.reversingEntryId)
      expect(rev).toBeTruthy()
    }
    // Payments are back in undeposited list
    const undepRes: any = await UndepositedGET()
    const undepBody = await undepRes.json()
    for (const id of paymentIds) {
      expect(undepBody.payments.some((p: any) => p.id === id)).toBe(true)
    }
  })
})
