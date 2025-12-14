import { GET as AP_DETAIL_GET } from '@/app/api/reports/ap-aging-detail/route'
import { db, seedIfNeeded, createBill } from '@/mock/db'

function makeReq(url: string): Request { return new Request(url) }

function iso(d: string) {
  // Accepts YYYY-MM-DD and returns ISO at UTC midnight
  const [y,m,da] = d.split('-').map(Number)
  return new Date(Date.UTC(y, (m - 1), da)).toISOString()
}

function addDays(base: string, deltaDays: number) {
  const [y,m,da] = base.split('-').map(Number)
  const dt = new Date(Date.UTC(y, (m - 1), da))
  dt.setUTCDate(dt.getUTCDate() + deltaDays)
  return dt.toISOString().slice(0,10)
}

describe('A/P Aging Detail bucket boundary edges', () => {
  const asOf = '2025-05-01'
  const vendorName = 'Vendor Boundary'
  let vendorId: string

  beforeAll(() => {
    seedIfNeeded()
    // Create a dedicated vendor to isolate rows in tests
    vendorId = `ven_test_${Math.random().toString(36).slice(2,8)}`
    db.vendors.push({ id: vendorId, name: vendorName })
    // Create bills with due dates exactly N days before asOf
    const cases: Array<{ days: number; bucket: '30'|'60'|'90'|'120+'; amount: number }> = [
      { days: 1, bucket: '30', amount: 101 },
      { days: 30, bucket: '30', amount: 130 },
      { days: 31, bucket: '60', amount: 161 },
      { days: 60, bucket: '60', amount: 260 },
      { days: 61, bucket: '90', amount: 361 },
      { days: 90, bucket: '90', amount: 490 },
      { days: 91, bucket: '120+', amount: 591 },
    ]
    for (const c of cases) {
      const due = addDays(asOf, -c.days)
      // billDate set to due to keep within [start,end] filtering
      createBill({ number: `B-BD-${c.days}`, vendorId, lines: [{ description: `Boundary ${c.days}`, amount: c.amount }], billDate: iso(due), dueDate: iso(due), terms: 'Due on receipt' })
    }
  })

  test('rows map to expected buckets at edges', async () => {
    const url = `http://localhost/api/reports/ap-aging-detail?start=2025-01-01&end=${asOf}&vendor=${encodeURIComponent(vendorName)}`
    const res: any = await AP_DETAIL_GET(makeReq(url))
    expect(res.status).toBe(200)
    const data = await res.json()
    const rows: Array<{ number: string; aging: number; dueDate: string; openBalance: number }> = data.rows
    // Build lookup by bill number
    const byNo = new Map(rows.map(r => [r.number, r]))
    const inBucket = (aging: number) => aging === 0 ? 'current' : (aging <= 30 ? '30' : aging <= 60 ? '60' : aging <= 90 ? '90' : '120+')
    const cases: Array<{ days: number; bucket: string }> = [
      { days: 1, bucket: '30' },
      { days: 30, bucket: '30' },
      { days: 31, bucket: '60' },
      { days: 60, bucket: '60' },
      { days: 61, bucket: '90' },
      { days: 90, bucket: '90' },
      { days: 91, bucket: '120+' },
    ]
    for (const c of cases) {
      const r = byNo.get(`B-BD-${c.days}`)
      expect(r).toBeTruthy()
      // Due date should be exactly asOf minus N days
      expect(r!.dueDate).toBe(addDays(asOf, -c.days))
      // Aging should be >= days (floor) and bucket should match
      expect(inBucket(r!.aging)).toBe(c.bucket)
      expect(r!.openBalance).toBeGreaterThan(0)
    }
  })

  test('bucket filter returns only matching boundary rows', async () => {
    const checks: Array<{ bucket: '30'|'60'|'90'|'120+'; nos: string[] }> = [
      { bucket: '30', nos: ['B-BD-1','B-BD-30'] },
      { bucket: '60', nos: ['B-BD-31','B-BD-60'] },
      { bucket: '90', nos: ['B-BD-61','B-BD-90'] },
      { bucket: '120+', nos: ['B-BD-91'] },
    ]
    for (const c of checks) {
      const url = `http://localhost/api/reports/ap-aging-detail?start=2025-01-01&end=${asOf}&vendor=${encodeURIComponent(vendorName)}&bucket=${encodeURIComponent(c.bucket)}`
      const res: any = await AP_DETAIL_GET(makeReq(url))
      expect(res.status).toBe(200)
      const data = await res.json()
      const gotNos = new Set((data.rows as any[]).map(r => r.number))
      // Should include all expected bill numbers for this bucket
      for (const n of c.nos) expect(gotNos.has(n)).toBe(true)
      // And should not include numbers from other buckets
      const allNos = ['B-BD-1','B-BD-30','B-BD-31','B-BD-60','B-BD-61','B-BD-90','B-BD-91']
      for (const n of allNos) {
        if (!c.nos.includes(n)) expect(gotNos.has(n)).toBe(false)
      }
    }
  })
})
