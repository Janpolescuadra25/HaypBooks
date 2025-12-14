import { POST as BATCH_SEND } from '@/app/api/customers/statements/pack/send/route'
import { seedIfNeeded, db } from '@/mock/db'
import { setRoleOverride } from '@/lib/rbac'

function makeReq(url: string) { return new Request(url, { method: 'POST' }) }

describe('Batch statement send idempotency', () => {
  beforeAll(() => { try { seedIfNeeded() } catch {} })
  afterEach(() => setRoleOverride(undefined as any))

  test('Second identical scope within window is idempotent and reuses batchId', async () => {
    setRoleOverride('manager' as any)
    const asOf = '2025-10-15'
    const ids = db.customers.slice(0,2).map((c: any) => c.id)
    const scope = `customerId=${ids.join(',')}`
    const first: any = await BATCH_SEND(makeReq(`http://local/api/customers/statements/pack/send?asOf=${asOf}&${scope}`))
    expect(first.status).toBe(200)
    const firstJson = await first.json()
    expect(firstJson.result.idempotent).toBe(false)
    const batchId = firstJson.result.batchId
    const auditCountBefore = (db.auditEvents || []).filter((e: any) => e.batchId === batchId || e.meta?.batchId === batchId).length
    const second: any = await BATCH_SEND(makeReq(`http://local/api/customers/statements/pack/send?asOf=${asOf}&${scope}`))
    expect(second.status).toBe(200)
    const secondJson = await second.json()
    expect(secondJson.result.idempotent).toBe(true)
    expect(secondJson.result.batchId).toBe(batchId)
    // Ensure no duplicate per-customer events appended for same batch
    const auditCountAfter = (db.auditEvents || []).filter((e: any) => e.batchId === batchId || e.meta?.batchId === batchId).length
    expect(auditCountAfter).toBe(auditCountBefore)
  })
})
