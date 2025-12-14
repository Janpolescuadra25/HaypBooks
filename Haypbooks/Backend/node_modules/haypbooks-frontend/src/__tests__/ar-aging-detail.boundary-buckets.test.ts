import { GET as AR_DETAIL_GET } from '@/app/api/reports/ar-aging-detail/route'
import { db, seedIfNeeded, createInvoice, updateInvoice } from '@/mock/db'

function makeReq(url: string): Request { return new Request(url) }

function iso(d: string) {
  const [y,m,da] = d.split('-').map(Number)
  return new Date(Date.UTC(y, (m - 1), da)).toISOString()
}

function addDays(base: string, deltaDays: number) {
  const [y,m,da] = base.split('-').map(Number)
  const dt = new Date(Date.UTC(y, (m - 1), da))
  dt.setUTCDate(dt.getUTCDate() + deltaDays)
  return dt.toISOString().slice(0,10)
}

describe('A/R Aging Detail bucket boundary edges', () => {
  const asOf = '2025-05-01'
  const customerName = 'Customer Boundary'
  let customerId: string

  beforeAll(() => {
    seedIfNeeded()
    // Create a dedicated customer to isolate rows in tests
    customerId = `cus_test_${Math.random().toString(36).slice(2,8)}`
    db.customers.push({ id: customerId, name: customerName })
    // Create invoices with due dates exactly N days before asOf
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
      const inv = createInvoice({ number: `INV-BD-${c.days}`, customerId, date: iso(due), dueDate: iso(due), lines: [{ description: `Boundary ${c.days}`, amount: c.amount }] })
      updateInvoice(inv.id, { status: 'sent' })
    }
  })

  test('rows map to expected buckets at edges', async () => {
    const url = `http://localhost/api/reports/ar-aging-detail?start=2025-01-01&end=${asOf}&customer=${encodeURIComponent(customerName)}`
    const res: any = await AR_DETAIL_GET(makeReq(url))
    expect(res.status).toBe(200)
    const data = await res.json()
    const rows: Array<{ number: string; aging: number; dueDate: string; openBalance: number }> = data.rows
    const byNo = new Map(rows.map((r: any) => [r.number, r]))
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
      const r = byNo.get(`INV-BD-${c.days}`)
      expect(r).toBeTruthy()
      expect(r!.dueDate).toBe(addDays(asOf, -c.days))
      expect(inBucket(r!.aging)).toBe(c.bucket)
      expect(r!.openBalance).toBeGreaterThan(0)
    }
  })

  test('bucket filter returns only matching boundary rows', async () => {
    const checks: Array<{ bucket: '30'|'60'|'90'|'120+'; nos: string[] }> = [
      { bucket: '30', nos: ['INV-BD-1','INV-BD-30'] },
      { bucket: '60', nos: ['INV-BD-31','INV-BD-60'] },
      { bucket: '90', nos: ['INV-BD-61','INV-BD-90'] },
      { bucket: '120+', nos: ['INV-BD-91'] },
    ]
    for (const c of checks) {
      const url = `http://localhost/api/reports/ar-aging-detail?start=2025-01-01&end=${asOf}&customer=${encodeURIComponent(customerName)}&bucket=${encodeURIComponent(c.bucket)}`
      const res: any = await AR_DETAIL_GET(makeReq(url))
      expect(res.status).toBe(200)
      const data = await res.json()
      const gotNos = new Set((data.rows as any[]).map(r => r.number))
      for (const n of c.nos) expect(gotNos.has(n)).toBe(true)
      const allNos = ['INV-BD-1','INV-BD-30','INV-BD-31','INV-BD-60','INV-BD-61','INV-BD-90','INV-BD-91']
      for (const n of allNos) {
        if (!c.nos.includes(n)) expect(gotNos.has(n)).toBe(false)
      }
    }
  })
})
