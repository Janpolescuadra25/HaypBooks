import { POST as RUN } from '@/app/api/recurring-transactions/run/route'
import { addTemplate, findTemplate } from '@/app/api/recurring-transactions/store'
import { NextRequest } from 'next/server'

function makeReq(body: any, role: 'viewer'|'user'|'admin'='user') {
  const req = new Request('http://test/api/recurring-transactions/run', { method: 'POST', body: JSON.stringify(body), headers: { 'content-type': 'application/json', 'x-role': role } }) as any
  req.cookies = { get: (_: string) => undefined }
  return req as NextRequest
}

describe('Recurring run materialization', () => {
  it('materializes a journal and advances schedule', async () => {
    const t = addTemplate({
      kind: 'journal', name: 'Accrual', status: 'active', startDate: '2025-01-31', frequency: 'monthly',
      lines: [ { description: 'Debit line', amount: 100, account: '6000', debit: 100 }, { description: 'Credit line', amount: 100, account: '2000', credit: 100 } ]
    })
    const beforeNext = t.nextRunDate
    const res: any = await RUN(makeReq({ id: t.id }))
    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json.materialized?.type).toBe('journal')
    expect(typeof json.materialized?.id).toBe('string')
    // nextRunDate should advance month-end safe (2025-01-31 -> 2025-02-28)
    const after = findTemplate(t.id)!
    expect(after.lastRunDate).toBe(beforeNext)
    expect(after.nextRunDate).toBe('2025-02-28')
  })

  it('materializes an invoice and a bill', async () => {
    const invT = addTemplate({ kind: 'invoice', name: 'Sub', status: 'active', startDate: '2025-02-10', frequency: 'monthly', lines: [{ description: 'Fee', amount: 99 }], customerId: 'cust_X' })
    const billT = addTemplate({ kind: 'bill', name: 'Vendor Fee', status: 'active', startDate: '2025-02-12', frequency: 'monthly', lines: [{ description: 'Cost', amount: 50 }], vendorId: 'ven_X' })
    const r1: any = await RUN(makeReq({ id: invT.id }))
    expect(r1.status).toBe(200)
    const j1 = await r1.json()
    expect(j1.materialized?.type).toBe('invoice')
    expect(typeof j1.materialized?.id).toBe('string')

    const r2: any = await RUN(makeReq({ id: billT.id }))
    expect(r2.status).toBe(200)
    const j2 = await r2.json()
    expect(j2.materialized?.type).toBe('bill')
    expect(typeof j2.materialized?.id).toBe('string')
  })
})
