import { GET as GET_JSON } from '@/app/api/reports/ar-aging/route'
import { seedIfNeeded, db, createInvoice, updateInvoice, createCustomerPayment } from '@/mock/db'

const makeReq = (url: string) => new Request(url)

describe('A/R Aging bucket math respects as-of and payment dates', () => {
  test('current → 1–30 with partial payment dated after due; row drops after fully paid', async () => {
    // Ensure base seed is present
    seedIfNeeded()

    // Create an isolated customer to avoid interaction with seeded customers
    const custId = 'cust_ar_aging_test'
    const custName = 'Aging Test Customer'
    if (!db.customers.find(c => c.id === custId)) {
      db.customers.push({ id: custId, name: custName, terms: 'Net 30', creditLimit: 5000 } as any)
    }

    // Create a controlled invoice: date 2025-01-10, due 2025-01-20, total 100
    const inv = createInvoice({
      number: 'INV-TEST-AGING',
      customerId: custId,
      date: '2025-01-10T00:00:00.000Z',
      lines: [{ description: 'Test', amount: 100 }],
      terms: 'Net 30',
      dueDate: '2025-01-20T00:00:00.000Z',
    })
    updateInvoice(inv.id, { status: 'sent' })

    // 1) As of 2025-01-15 (before due): entire open balance should be in Current
    let res: any = await GET_JSON(makeReq('http://localhost/api/reports/ar-aging?end=2025-01-15'))
    let data = await res.json()
    let row = (data.rows as any[]).find(r => r.name === custName)
    expect(row).toBeTruthy()
    expect(row.current).toBe(100)
    expect(row['30']).toBe(0)
    expect(row['60']).toBe(0)
    expect(row['90']).toBe(0)
    expect(row['120+']).toBe(0)

    // 2) As of 2025-02-05 (after due by 16 days): entire open balance in 1–30 bucket
    res = await GET_JSON(makeReq('http://localhost/api/reports/ar-aging?end=2025-02-05'))
    data = await res.json()
    row = (data.rows as any[]).find((r: any) => r.name === custName)
    expect(row).toBeTruthy()
    expect(row.current).toBe(0)
    expect(row['30']).toBe(100)
    expect(row['60']).toBe(0)

    // 3) Apply a partial payment of 40 dated 2025-02-10 (after due, before next as-of)
    createCustomerPayment({
      customerId: custId,
      amountReceived: 40,
      allocations: [{ invoiceId: inv.id, amount: 40 }],
      date: '2025-02-10',
      method: 'Card',
      reference: 'TEST-PAY-1',
      autoCreditUnapplied: false,
    })

    // As of 2025-02-15: remaining open (60) should be in 1–30 bucket
    res = await GET_JSON(makeReq('http://localhost/api/reports/ar-aging?end=2025-02-15'))
    data = await res.json()
    row = (data.rows as any[]).find((r: any) => r.name === custName)
    expect(row).toBeTruthy()
    expect(row.current).toBe(0)
    expect(row['30']).toBe(60)
    expect(row.total).toBe(60)

    // 4) Apply remaining 60 dated 2025-03-25; as of 2025-04-30, the row should disappear (fully paid)
    createCustomerPayment({
      customerId: custId,
      amountReceived: 60,
      allocations: [{ invoiceId: inv.id, amount: 60 }],
      date: '2025-03-25',
      method: 'ACH',
      reference: 'TEST-PAY-2',
      autoCreditUnapplied: false,
    })

    res = await GET_JSON(makeReq('http://localhost/api/reports/ar-aging?end=2025-04-30'))
    data = await res.json()
    row = (data.rows as any[]).find((r: any) => r.customer === custName)
    expect(row).toBeUndefined()
  })
})
