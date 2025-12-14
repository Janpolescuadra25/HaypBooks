import { GET as AP_DETAIL_GET } from '@/app/api/reports/ap-aging-detail/route'
import { db, seedIfNeeded, createBill } from '@/mock/db'

function makeReq(url: string): Request { return new Request(url) }

describe('A/P Aging Detail vendorId filter', () => {
  let venA: { id: string; name: string }
  let venB: { id: string; name: string }

  beforeAll(() => {
    seedIfNeeded()
    venA = { id: `ven_A_${Math.random().toString(36).slice(2,8)}`, name: 'Vendor A Filter' }
    venB = { id: `ven_B_${Math.random().toString(36).slice(2,8)}`, name: 'Vendor B Filter' }
    db.vendors.push(venA, venB)
    // Two bills per vendor
    createBill({ number: 'BILL-A-1', vendorId: venA.id, billDate: '2025-02-01', dueDate: '2025-02-15', lines: [{ description: 'A1', amount: 100 }] })
    createBill({ number: 'BILL-A-2', vendorId: venA.id, billDate: '2025-02-05', dueDate: '2025-02-20', lines: [{ description: 'A2', amount: 200 }] })
    createBill({ number: 'BILL-B-1', vendorId: venB.id, billDate: '2025-02-02', dueDate: '2025-02-16', lines: [{ description: 'B1', amount: 150 }] })
    createBill({ number: 'BILL-B-2', vendorId: venB.id, billDate: '2025-02-06', dueDate: '2025-02-21', lines: [{ description: 'B2', amount: 250 }] })
  })

  test('vendorId restricts results to that vendor only', async () => {
    const urlA = `http://localhost/api/reports/ap-aging-detail?start=2025-02-01&end=2025-02-28&vendorId=${encodeURIComponent(venA.id)}`
    const resA: any = await AP_DETAIL_GET(makeReq(urlA))
    expect(resA.status).toBe(200)
    const dataA = await resA.json()
    const numbersA = new Set((dataA.rows as any[]).map(r => r.number))
    expect(numbersA.has('BILL-A-1')).toBe(true)
    expect(numbersA.has('BILL-A-2')).toBe(true)
    expect(numbersA.has('BILL-B-1')).toBe(false)
    expect(numbersA.has('BILL-B-2')).toBe(false)

    const urlB = `http://localhost/api/reports/ap-aging-detail?start=2025-02-01&end=2025-02-28&vendorId=${encodeURIComponent(venB.id)}`
    const resB: any = await AP_DETAIL_GET(makeReq(urlB))
    expect(resB.status).toBe(200)
    const dataB = await resB.json()
    const numbersB = new Set((dataB.rows as any[]).map(r => r.number))
    expect(numbersB.has('BILL-B-1')).toBe(true)
    expect(numbersB.has('BILL-B-2')).toBe(true)
    expect(numbersB.has('BILL-A-1')).toBe(false)
    expect(numbersB.has('BILL-A-2')).toBe(false)
  })
})
