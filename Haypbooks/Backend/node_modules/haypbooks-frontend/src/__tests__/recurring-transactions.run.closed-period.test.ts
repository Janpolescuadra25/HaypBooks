import { POST as RUN } from '@/app/api/recurring-transactions/run/route'
import { addTemplate, findTemplate } from '@/app/api/recurring-transactions/store'
import { closeThrough, reopenThrough } from '@/lib/periods'
import { NextRequest } from 'next/server'

function makeReq(body: any, role: 'viewer'|'user'|'admin'='user') {
  const req = new Request('http://test/api/recurring-transactions/run', { method: 'POST', body: JSON.stringify(body), headers: { 'content-type': 'application/json', 'x-role': role } }) as any
  req.cookies = { get: (_: string) => undefined }
  return req as NextRequest
}

describe('Recurring run closed-period guard', () => {
  afterEach(() => { try { reopenThrough() } catch { /* noop */ } })

  it('blocks run when nextRunDate is in closed period', async () => {
    // Close through Jan 31, 2025
    closeThrough('2025-01-31')
    const t = addTemplate({ kind: 'invoice', name: 'Blocked', status: 'active', startDate: '2025-01-31', frequency: 'monthly', lines: [{ description: 'Line', amount: 10 }], customerId: 'c1' })
    const before = { next: t.nextRunDate, status: t.status }
    const res: any = await RUN(makeReq({ id: t.id }))
    expect(res.status).toBe(400)
    const body = await res.json()
    expect(body.code).toBe('PERIOD_CLOSED')
    // Ensure template unchanged
    const after = findTemplate(t.id)!
    expect(after.nextRunDate).toBe(before.next)
    expect(after.status).toBe(before.status)
  })
})
