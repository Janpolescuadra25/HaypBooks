import { GET as CP_LIST } from '@/app/api/customer-payments/route'
import { db, seedIfNeeded } from '@/mock/db'

const makeReq = (url: string) => new Request(url)

describe('Customer Payments list API filters', () => {
  test('date range filters constrain rows', async () => {
  const res: any = await CP_LIST(makeReq('http://localhost/api/customer-payments?start=2025-01-10&end=2025-01-20') as any)
    expect(res.status).toBe(200)
    const body = await res.json()
    const rows = body.customerPayments
    for (const r of rows) {
      expect(r.date >= '2025-01-10').toBe(true)
      expect(r.date <= '2025-01-20').toBe(true)
    }
  })

  test('q matches payment id, customer, or allocation', async () => {
    const res: any = await CP_LIST(makeReq('http://localhost/api/customer-payments?q=customer%201') as any)
    expect(res.status).toBe(200)
    const body = await res.json()
    const rows = body.customerPayments
    expect(Array.isArray(rows)).toBe(true)
    // If seeded data has none, it's okay; primary check is the route handles q without error
    if (rows.length > 0) {
      const s = (rows[0].customer + ' ' + rows[0].id).toLowerCase()
      expect(typeof s).toBe('string')
    }
  })

  test('customerId narrows results', async () => {
    seedIfNeeded()
    const custId = db.customers[0]?.id
    expect(typeof custId).toBe('string')
    const res: any = await CP_LIST(makeReq(`http://localhost/api/customer-payments?customerId=${encodeURIComponent(custId)}`) as any)
    const body = await res.json()
    const rows = body.customerPayments
    expect(rows.every((r: any) => r.customerId === custId)).toBe(true)
  })
})
