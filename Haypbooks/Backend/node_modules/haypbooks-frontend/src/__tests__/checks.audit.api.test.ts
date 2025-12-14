import { POST as ISSUE_POST } from '@/app/api/checks/route'
import { POST as PRINTED_POST } from '@/app/api/checks/[id]/printed/route'
import { POST as VOID_POST } from '@/app/api/checks/[id]/void/route'
import { seedIfNeeded, db, reopenPeriodWithAudit } from '@/mock/db'
import { setRoleOverride } from '@/lib/rbac-server'

function makeReq(url: string, body?: any) {
  return new Request(url, { method: 'POST', body: body ? JSON.stringify(body) : undefined, headers: { 'content-type': 'application/json' } }) as any
}

describe('Checks audit events', () => {
  beforeAll(() => { seedIfNeeded(); try { reopenPeriodWithAudit() } catch {} })
  beforeEach(() => { setRoleOverride('admin' as any); (db.auditEvents || []).length = 0 })
  afterEach(() => { setRoleOverride(undefined as any) })

  test('issue -> printed -> void logs audit events', async () => {
    const issueRes: any = await ISSUE_POST(makeReq('http://local/api/checks', { payee: 'Vendor X', amount: 123.45, account: 'acc-bank-1', date: '2025-10-15' }))
    expect(issueRes.status).toBe(200)
    const issued = await issueRes.json()
    const id = issued.check.id

    // printed
    const printRes: any = await PRINTED_POST(makeReq(`http://local/api/checks/${id}/printed`), { params: { id } } as any)
    expect(printRes.status).toBe(200)

    // void
    const voidRes: any = await VOID_POST(makeReq(`http://local/api/checks/${id}/void`, { voidDate: '2025-10-16', reason: 'Test' }), { params: { id } } as any)
    expect(voidRes.status).toBe(200)

    const rows = (db.auditEvents || []).filter(e => e.entityType === 'check' && e.entityId === id)
    const actions = rows.map(e => e.action).sort()
    expect(actions).toEqual(['check:create','check:printed','check:void'])
  })
})
