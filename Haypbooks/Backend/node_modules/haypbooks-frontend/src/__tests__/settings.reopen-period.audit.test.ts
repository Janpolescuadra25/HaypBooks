import { POST as POST_REOPEN } from '@/app/api/settings/reopen-period/route'
import { POST as POST_CLOSE } from '@/app/api/settings/close-period/route'
import { db, reopenPeriodWithAudit } from '@/mock/db'

function makeReq(url: string, method: string = 'POST', body?: any) {
  const init: any = { method, headers: { 'Content-Type': 'application/json' } }
  if (body) init.body = JSON.stringify(body)
  return new Request(url, init)
}

describe('Settings reopen-period audit', () => {
  beforeEach(() => { (db.auditEvents || []).length = 0 })

  it('records an audit event when reopening period via API', async () => {
    // Close first to set a closeDate and record close audit
    await POST_CLOSE(makeReq('http://localhost/api/settings/close-period', 'POST', { date: '2025-01-31' }))
    const before = (db.auditEvents || []).filter(e => e.action === 'reopen-period').length
    const res: any = await POST_REOPEN(makeReq('http://localhost/api/settings/reopen-period', 'POST'))
    expect(res.status).toBe(200)
    const after = (db.auditEvents || []).filter(e => e.action === 'reopen-period').length
    expect(after).toBeGreaterThan(before)
  })

  it('reopenPeriodWithAudit records audit directly (safety)', () => {
    const before = (db.auditEvents || []).filter(e => e.action === 'reopen-period').length
    reopenPeriodWithAudit()
    const after = (db.auditEvents || []).filter(e => e.action === 'reopen-period').length
    expect(after).toBeGreaterThan(before)
  })
})
