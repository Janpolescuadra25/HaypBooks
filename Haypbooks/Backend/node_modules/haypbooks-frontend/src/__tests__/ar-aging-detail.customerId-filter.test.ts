import { GET as AR_DETAIL_GET } from '@/app/api/reports/ar-aging-detail/route'
import { db, seedIfNeeded, createInvoice, updateInvoice } from '@/mock/db'

function makeReq(url: string): Request { return new Request(url) }

describe('A/R Aging Detail customerId filter', () => {
  let custA: { id: string; name: string }
  let custB: { id: string; name: string }

  beforeAll(() => {
    seedIfNeeded()
    custA = { id: `cus_A_${Math.random().toString(36).slice(2,8)}`, name: 'Cust A Filter' }
    custB = { id: `cus_B_${Math.random().toString(36).slice(2,8)}`, name: 'Cust B Filter' }
    db.customers.push(custA, custB)
    // Create two invoices per customer with same as-of window
  const a1 = createInvoice({ number: 'INV-A-1', customerId: custA.id, date: '2025-02-01', dueDate: '2025-02-15', lines: [{ description: 'A1', amount: 100 }] })
  const a2 = createInvoice({ number: 'INV-A-2', customerId: custA.id, date: '2025-02-05', dueDate: '2025-02-20', lines: [{ description: 'A2', amount: 200 }] })
  const b1 = createInvoice({ number: 'INV-B-1', customerId: custB.id, date: '2025-02-02', dueDate: '2025-02-16', lines: [{ description: 'B1', amount: 150 }] })
  const b2 = createInvoice({ number: 'INV-B-2', customerId: custB.id, date: '2025-02-06', dueDate: '2025-02-21', lines: [{ description: 'B2', amount: 250 }] })
  // Mark as sent to include in aging reports (drafts excluded)
  updateInvoice(a1.id, { status: 'sent' })
  updateInvoice(a2.id, { status: 'sent' })
  updateInvoice(b1.id, { status: 'sent' })
  updateInvoice(b2.id, { status: 'sent' })
  })

  test('customerId restricts results to that customer only', async () => {
    const urlA = `http://localhost/api/reports/ar-aging-detail?start=2025-02-01&end=2025-02-28&customerId=${encodeURIComponent(custA.id)}`
    const resA: any = await AR_DETAIL_GET(makeReq(urlA))
    expect(resA.status).toBe(200)
    const dataA = await resA.json()
    const numbersA = new Set((dataA.rows as any[]).map(r => r.number))
    expect(numbersA.has('INV-A-1')).toBe(true)
    expect(numbersA.has('INV-A-2')).toBe(true)
    expect(numbersA.has('INV-B-1')).toBe(false)
    expect(numbersA.has('INV-B-2')).toBe(false)

    const urlB = `http://localhost/api/reports/ar-aging-detail?start=2025-02-01&end=2025-02-28&customerId=${encodeURIComponent(custB.id)}`
    const resB: any = await AR_DETAIL_GET(makeReq(urlB))
    expect(resB.status).toBe(200)
    const dataB = await resB.json()
    const numbersB = new Set((dataB.rows as any[]).map(r => r.number))
    expect(numbersB.has('INV-B-1')).toBe(true)
    expect(numbersB.has('INV-B-2')).toBe(true)
    expect(numbersB.has('INV-A-1')).toBe(false)
    expect(numbersB.has('INV-A-2')).toBe(false)
  })
})
