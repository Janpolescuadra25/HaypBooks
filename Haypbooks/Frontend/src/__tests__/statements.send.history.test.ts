import { POST as BATCH_SEND } from '@/app/api/customers/statements/pack/send/route'
import { GET as HIST_JSON } from '@/app/api/customers/statements/send/history/route'
import { GET as HIST_CSV } from '@/app/api/customers/statements/send/history/export/route'
import { seedIfNeeded, db } from '@/mock/db'
import { setRoleOverride } from '@/lib/rbac'

function post(url: string) { return new Request(url, { method: 'POST' }) }
function get(url: string) { return new Request(url) }

describe('Statement Send History', () => {
  beforeAll(() => { try { seedIfNeeded() } catch {} })
  afterEach(() => setRoleOverride(undefined as any))

  test('RBAC 403 when missing permissions', async () => {
    setRoleOverride('viewer' as any)
    const r: any = await HIST_JSON(get('http://local/api/customers/statements/send/history'))
    expect(r.status).toBe(403)
  })

  test('History returns events and supports filtering', async () => {
    setRoleOverride('manager' as any)
    const asOf = '2025-10-15'
    // create a small batch send to generate events
    const target = (db.customers || []).slice(0, 2).map((c: any) => c.id)
    const q = target.length ? `&customerId=${target.join(',')}` : ''
    const sendRes: any = await BATCH_SEND(post(`http://local/api/customers/statements/pack/send?asOf=${asOf}${q}`))
    expect(sendRes.status).toBe(200)
    const sendJson = await sendRes.json()
    const batchId = sendJson.result.batchId

    setRoleOverride('admin' as any)
    const r1: any = await HIST_JSON(get('http://local/api/customers/statements/send/history?start=2025-10-01&end=2025-10-31'))
    expect(r1.status).toBe(200)
    const j1 = await r1.json()
    expect(j1.history.count).toBeGreaterThan(0)
    // filter by batchId
    const r2: any = await HIST_JSON(get(`http://local/api/customers/statements/send/history?batchId=${batchId}`))
    const j2 = await r2.json()
    expect(j2.history.rows.every((row: any) => row.batchId === batchId)).toBe(true)
    // filter by customerId
    if (target[0]) {
      const r3: any = await HIST_JSON(get(`http://local/api/customers/statements/send/history?customerId=${target[0]}`))
      const j3 = await r3.json()
      expect(j3.history.rows.every((row: any) => row.customerId === target[0])).toBe(true)
    }
  })

  test('CSV export includes version row and expected headers', async () => {
    setRoleOverride('admin' as any)
    const r: any = await HIST_CSV(get('http://local/api/customers/statements/send/history/export?csv=1&start=2025-10-01&end=2025-10-31'))
    expect(r.status).toBe(200)
    const text = await r.text()
    const lines = text.trim().split(/\n/)
  expect(lines[0]).toBe('CSV-Version,1')
  expect(lines.some((l: string) => l.startsWith('Date,Customer,As Of,Type,Status,Message Id,Batch Id'))).toBe(true)
  })

  test('CSV export RBAC: requires both audit:read and reports:read', async () => {
    // viewer has reports:read but not necessarily audit:read
    setRoleOverride('viewer' as any)
    const r1: any = await HIST_CSV(get('http://local/api/customers/statements/send/history/export'))
    expect(r1.status).toBe(403)
    // admin has both
    setRoleOverride('admin' as any)
    const r2: any = await HIST_CSV(get('http://local/api/customers/statements/send/history/export'))
    expect(r2.status).toBe(200)
  })
})
