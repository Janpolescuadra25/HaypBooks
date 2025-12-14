import { POST as BATCH_REM } from '@/app/api/collections/reminders/batch/route'
import { GET as BATCH_REM_AUDIT } from '@/app/api/collections/reminders/batch/audit/route'
import { seedIfNeeded, db } from '@/mock/db'
import { setRoleOverride } from '@/lib/rbac'

function makePost(url: string) { return new Request(url, { method: 'POST' }) }
function makeGet(url: string) { return new Request(url) }

describe('Batch Collections Reminders', () => {
  beforeAll(() => { try { seedIfNeeded() } catch {} })
  afterEach(() => setRoleOverride(undefined as any))

  test('RBAC 403 when lacking collections:send', async () => {
    setRoleOverride('viewer' as any)
    const res: any = await BATCH_REM(makePost('http://local/api/collections/reminders/batch?asOf=2025-10-15'))
    expect(res.status).toBe(403)
  })

  test('400 invalid asOf', async () => {
    setRoleOverride('manager' as any)
    const res: any = await BATCH_REM(makePost('http://local/api/collections/reminders/batch?asOf=bad-date'))
    expect(res.status).toBe(400)
  })

  test('Successful batch reminder creates audit events and respects throttle', async () => {
    setRoleOverride('manager' as any)
    // Pick one overdue invoice candidate (ensure dueDate < asOf and balance > 0)
    const candidate = db.invoices.find((inv: any) => inv.dueDate.slice(0,10) < '2025-10-15' && inv.balance > 0 && inv.status !== 'draft')
    expect(candidate).toBeTruthy()
    const custId = candidate!.customerId
    const res1: any = await BATCH_REM(makePost(`http://local/api/collections/reminders/batch?asOf=2025-10-15&customerId=${custId}`))
    expect(res1.status).toBe(200)
    const json1 = await res1.json()
    expect(json1.result.count).toBeGreaterThanOrEqual(1)
    const batchId1 = json1.result.batchId
  const invAfter = db.invoices.find((i: any) => i.id === candidate!.id)
  expect(invAfter).toBeTruthy()
  if (invAfter) expect(invAfter.lastReminderDate).toBe('2025-10-15')
    // Second attempt within 5 days should skip (count zero or exclude same invoice)
    const res2: any = await BATCH_REM(makePost(`http://local/api/collections/reminders/batch?asOf=2025-10-17&customerId=${custId}`))
    expect(res2.status).toBe(200)
    const json2 = await res2.json()
    // Either zero updates or not containing the same invoice (throttle)
    if (json2.result.count > 0) {
      const ids = json2.result.items.map((x: any) => x.invoiceId)
      expect(ids).not.toContain(candidate!.id)
    }
    // Audit wrapper present
    const wrapper = (db.auditEvents || []).find((e: any) => e.action === 'reminder:send:batch' && e.entityId === batchId1)
    expect(wrapper).toBeTruthy()
  })

  test('Batch audit retrieval works', async () => {
    setRoleOverride('admin' as any)
    const listRes: any = await BATCH_REM_AUDIT(makeGet('http://local/api/collections/reminders/batch/audit'))
    expect(listRes.status).toBe(200)
    const listJson = await listRes.json()
    expect(Array.isArray(listJson.events)).toBe(true)
    const first = listJson.events[0]
    if (first) {
      const detailRes: any = await BATCH_REM_AUDIT(makeGet(`http://local/api/collections/reminders/batch/audit?batchId=${first.entityId}`))
      expect(detailRes.status).toBe(200)
      const detailJson = await detailRes.json()
      expect(Array.isArray(detailJson.events)).toBe(true)
      expect(Array.isArray(detailJson.children)).toBe(true)
    }
  })
})
