import { POST as RUN } from '@/app/api/recurring-transactions/run/route'
import { POST as PAUSE } from '@/app/api/recurring-transactions/pause/route'
import { POST as RESUME } from '@/app/api/recurring-transactions/resume/route'
import { addTemplate } from '@/app/api/recurring-transactions/store'
import { NextRequest } from 'next/server'

function makeReq(url: string, body: any, role: 'viewer'|'user'|'admin') {
  const req = new Request(url, { method: 'POST', body: JSON.stringify(body), headers: { 'content-type': 'application/json', 'x-role': role } }) as any
  req.cookies = { get: (_: string) => undefined }
  return req as NextRequest
}

describe('Recurring action RBAC', () => {
  it('viewer forbidden for run/pause/resume', async () => {
    const t = addTemplate({ kind: 'invoice', name: 'RBAC Actions', status: 'active', startDate: '2025-02-10', frequency: 'monthly', lines: [{ description: 'L', amount: 5 }] })
    const r: any = await RUN(makeReq('http://test/run',{ id: t.id }, 'viewer'))
    expect(r.status).toBe(403)
    const p: any = await PAUSE(makeReq('http://test/pause',{ id: t.id }, 'viewer'))
    expect(p.status).toBe(403)
  })

  it('user can pause then resume then run', async () => {
    const t = addTemplate({ kind: 'bill', name: 'Lifecycle', status: 'active', startDate: '2025-02-15', frequency: 'monthly', lines: [{ description: 'Cost', amount: 20 }], vendorId: 'v1' })
    const pauseRes: any = await PAUSE(makeReq('http://test/pause',{ id: t.id }, 'user'))
    expect(pauseRes.status).toBe(200)
    const resumeRes: any = await RESUME(makeReq('http://test/resume',{ id: t.id }, 'user'))
    expect(resumeRes.status).toBe(200)
    const runRes: any = await RUN(makeReq('http://test/run',{ id: t.id }, 'user'))
    expect(runRes.status).toBe(200)
  })
})
