import { GET as HISTORY_JSON } from '@/app/api/collections/reminders/history/route'
import { GET as HISTORY_CSV } from '@/app/api/collections/reminders/history/export/route'
import { POST as REM_BATCH } from '@/app/api/collections/reminders/batch/route'
import { seedIfNeeded } from '@/mock/db'
import { setRoleOverride } from '@/lib/rbac'

function get(url: string) { return new Request(url) }
function post(url: string) { return new Request(url, { method: 'POST' }) }

describe('Reminder History Report', () => {
  beforeAll(() => { try { seedIfNeeded() } catch {} })
  afterEach(() => setRoleOverride(undefined as any))

  async function seedSomeHistory() {
    setRoleOverride('manager' as any)
    // create two batches on different days for same invoice/customer
    const asOf1 = '2025-10-10'
    const asOf2 = '2025-10-16' // >5 days to pass throttle
    await REM_BATCH(post(`http://local/api/collections/reminders/batch?asOf=${asOf1}`))
    await REM_BATCH(post(`http://local/api/collections/reminders/batch?asOf=${asOf2}`))
  }

  test('RBAC 403 when missing either audit:read or reports:read', async () => {
    setRoleOverride('viewer' as any) // viewer likely has reports:read but not audit:read
    const r1: any = await HISTORY_JSON(get('http://local/api/collections/reminders/history'))
    expect(r1.status).toBe(403)
  })

  test('JSON history returns rows filtered by customerId and date range', async () => {
    await seedSomeHistory()
    // Use admin for both permissions
    setRoleOverride('admin' as any)
    const r: any = await HISTORY_JSON(get('http://local/api/collections/reminders/history?start=2025-10-01&end=2025-10-31'))
    expect(r.status).toBe(200)
    const j = await r.json()
    expect(j.history.count).toBeGreaterThan(0)
    const first = j.history.rows[0]
    if (first) {
      const custId = first.customerId
      const r2: any = await HISTORY_JSON(get(`http://local/api/collections/reminders/history?customerId=${custId}`))
      const j2 = await r2.json()
      // All rows should have same customerId
      expect(j2.history.rows.every((row: any) => row.customerId === custId)).toBe(true)
    }
  })

  test('CSV export emits version row when requested', async () => {
    setRoleOverride('admin' as any)
    const r: any = await HISTORY_CSV(get('http://local/api/collections/reminders/history/export?csv=1&start=2025-10-01&end=2025-10-31'))
    expect(r.status).toBe(200)
    const text = await r.text()
    const lines = text.trim().split(/\n/)
  expect(lines[0]).toBe('CSV-Version,1')
    // Header should appear after version line
  const headerIdx = lines.findIndex((l: string) => l.startsWith('Date,Customer,Invoice,'))
    expect(headerIdx).toBeGreaterThan(1)
  })

  test('CSV export without version omits version row', async () => {
    setRoleOverride('admin' as any)
    const r: any = await HISTORY_CSV(get('http://local/api/collections/reminders/history/export'))
    expect(r.status).toBe(200)
    const text = await r.text()
  expect(text.includes('CSV-Version,1')).toBe(false)
  })

  test('CSV export RBAC: requires both audit:read and reports:read', async () => {
    setRoleOverride('viewer' as any)
    const r1: any = await HISTORY_CSV(get('http://local/api/collections/reminders/history/export'))
    expect(r1.status).toBe(403)
    setRoleOverride('admin' as any)
    const r2: any = await HISTORY_CSV(get('http://local/api/collections/reminders/history/export'))
    expect(r2.status).toBe(200)
  })
})
