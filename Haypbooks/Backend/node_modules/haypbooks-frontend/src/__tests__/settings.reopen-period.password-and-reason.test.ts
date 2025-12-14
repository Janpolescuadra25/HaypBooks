import { POST as POST_REOPEN } from '@/app/api/settings/reopen-period/route'
import { POST as POST_CLOSE } from '@/app/api/settings/close-period/route'
import { POST as POST_CLOSEPWD } from '@/app/api/settings/close-password/route'
import { db } from '@/mock/db'

function makeReq(url: string, method: string = 'POST', body?: any) {
  const init: any = { method, headers: { 'Content-Type': 'application/json' } }
  if (body !== undefined) init.body = JSON.stringify(body)
  return new Request(url, init)
}

describe('Reopen period: password enforcement and reason audit', () => {
  beforeEach(() => {
    // Reset audit log and settings fields we care about
    ;(db.auditEvents || []).length = 0
    if (db.settings) { db.settings.closeDate = null; db.settings.closePassword = undefined }
  })

  it('requires close password when set and records provided reason', async () => {
    // 1) Enable a close password and close the period
    let res: any = await POST_CLOSEPWD(makeReq('http://localhost/api/settings/close-password', 'POST', { password: 'letmein' }))
    expect(res.status).toBe(200)
    res = await POST_CLOSE(makeReq('http://localhost/api/settings/close-period', 'POST', { date: '2025-01-31', password: 'letmein' }))
    expect(res.status).toBe(200)

    // 2) Attempt to reopen without password -> 403
    let rOpen: any = await POST_REOPEN(makeReq('http://localhost/api/settings/reopen-period', 'POST', { reason: 'typo fix' }))
    expect(rOpen.status).toBe(403)
    let body = await rOpen.json()
    expect(body.error).toMatch(/password/i)

    // 3) Reopen with correct password and reason -> 200 and audit event recorded with meta.reason
    const before = (db.auditEvents || []).filter(e => e.action === 'reopen-period').length
    rOpen = await POST_REOPEN(makeReq('http://localhost/api/settings/reopen-period', 'POST', { password: 'letmein', reason: 'fix prior period accrual' }))
    expect(rOpen.status).toBe(200)
    const after = (db.auditEvents || []).filter(e => e.action === 'reopen-period').length
    expect(after).toBeGreaterThan(before)
    const evt = (db.auditEvents || []).reverse().find(e => e.action === 'reopen-period') as any
    expect(evt?.meta?.reason).toBe('fix prior period accrual')
  })
})
