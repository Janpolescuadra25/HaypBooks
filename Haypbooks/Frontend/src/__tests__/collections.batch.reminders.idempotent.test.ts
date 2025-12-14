import { POST as REM_BATCH } from '@/app/api/collections/reminders/batch/route'
import { seedIfNeeded, db } from '@/mock/db'
import { setRoleOverride } from '@/lib/rbac'

function post(url: string) { return new Request(url, { method: 'POST' }) }

describe('Reminder Batch Idempotency', () => {
  beforeAll(() => { try { seedIfNeeded() } catch {} })
  afterEach(() => setRoleOverride(undefined as any))

  test('Same scope within 10 minutes returns idempotent=true without duplicating audit events', async () => {
    setRoleOverride('manager' as any)
    const asOf = '2025-10-15'
    const beforeCount = (db.auditEvents || []).length
    const r1: any = await REM_BATCH(post(`http://local/api/collections/reminders/batch?asOf=${asOf}`))
    expect(r1.status).toBe(200)
    const j1 = await r1.json()
    expect(j1.result.idempotent).toBe(false)
    const midCount = (db.auditEvents || []).length
    const r2: any = await REM_BATCH(post(`http://local/api/collections/reminders/batch?asOf=${asOf}`))
    expect(r2.status).toBe(200)
    const j2 = await r2.json()
    expect(j2.result.idempotent).toBe(true)
    const afterCount = (db.auditEvents || []).length
    // No new audit events added on idempotent replay
    expect(afterCount).toBe(midCount)
    expect(midCount).toBeGreaterThan(beforeCount)
    expect(j2.result.batchId).toBe(j1.result.batchId)
  })
})
