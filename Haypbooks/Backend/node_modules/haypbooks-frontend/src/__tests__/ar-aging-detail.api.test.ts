import { GET as GET_DETAIL } from '@/app/api/reports/ar-aging-detail/route'
import { seedIfNeeded, db, createInvoice, updateInvoice, createCustomerPayment } from '@/mock/db'

const makeReq = (url: string) => new Request(url)

describe('A/R Aging Detail API', () => {
  test('filters by bucket and respects as-of per payment date', async () => {
    seedIfNeeded()
    const custId = 'cust_ar_aging_detail_test'
    const custName = 'Aging Detail Customer'
    if (!db.customers.find(c => c.id === custId)) {
      db.customers.push({ id: custId, name: custName, terms: 'Net 30', creditLimit: 5000 } as any)
    }

    const inv = createInvoice({
      number: 'INV-TEST-AGING-DETAIL',
      customerId: custId,
      date: '2025-01-05T00:00:00.000Z',
      lines: [{ description: 'Detail Test', amount: 200 }],
      terms: 'Net 30',
      dueDate: '2025-02-04T00:00:00.000Z',
    })
    updateInvoice(inv.id, { status: 'sent' })

    // As of 2025-02-20, this is 16 days past due => bucket 30
    let res: any = await GET_DETAIL(makeReq('http://localhost/api/reports/ar-aging-detail?end=2025-02-20&bucket=30'))
    let data = await res.json()
    let has = (data.rows as any[]).some(r => r.customer === custName && r.number === 'INV-TEST-AGING-DETAIL')
    expect(has).toBe(true)

    // Apply payment dated 2025-02-22 (after as-of), so as-of 2025-02-20 should still show open
    createCustomerPayment({
      customerId: custId,
      amountReceived: 200,
      allocations: [{ invoiceId: inv.id, amount: 200 }],
      date: '2025-02-22',
      method: 'Card',
      reference: 'DETAIL-PAY-1',
      autoCreditUnapplied: false,
    })
    res = await GET_DETAIL(makeReq('http://localhost/api/reports/ar-aging-detail?end=2025-02-20&bucket=30'))
    data = await res.json()
    has = (data.rows as any[]).some(r => r.customer === custName && r.number === 'INV-TEST-AGING-DETAIL')
    expect(has).toBe(true)

    // As of 2025-02-25 (after payment date), the row should be gone
    res = await GET_DETAIL(makeReq('http://localhost/api/reports/ar-aging-detail?end=2025-02-25&bucket=30'))
    data = await res.json()
    has = (data.rows as any[]).some(r => r.customer === custName && r.number === 'INV-TEST-AGING-DETAIL')
    expect(has).toBe(false)
  })
})
