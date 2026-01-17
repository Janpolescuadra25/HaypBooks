import { GET as GET_JSON } from '@/app/api/reports/ar-aging/route'
import { seedIfNeeded, db, createInvoice, updateInvoice } from '@/mock/db'

const makeReq = (url: string) => new Request(url)

describe('A/R Aging bucket boundaries (exact edges)', () => {
  test('0, 30, 31, 60, 61, 90, 91 day boundaries map to correct buckets', async () => {
    seedIfNeeded()
    const custId = 'cust_ar_aging_boundaries'
    const custName = 'Aging Boundaries Customer'
    if (!db.customers.find(c => c.id === custId)) {
      db.customers.push({ id: custId, name: custName, terms: 'Net 30', creditLimit: 5000 } as any)
    }

    // Controlled invoice: date 2025-01-01, due 2025-02-01, total 100
    const inv = createInvoice({
      number: 'INV-AGING-BOUNDARY',
      customerId: custId,
      date: '2025-01-01T00:00:00.000Z',
      lines: [{ description: 'Boundary', amount: 100 }],
      terms: 'Net 30',
      dueDate: '2025-02-01T00:00:00.000Z',
    })
    updateInvoice(inv.id, { status: 'sent' })

    // Helper to fetch row for our customer
    const getRow = async (asOf: string) => {
      const res: any = await GET_JSON(makeReq(`http://localhost/api/reports/ar-aging?end=${asOf}`))
      const data = await res.json()
      return (data.rows as any[]).find(r => r.name === custName)
    }

    // As of exact due date → Current
    let row = await getRow('2025-02-01')
    expect(row).toBeTruthy()
    expect(row.current).toBe(100)
    expect(row['30']).toBe(0)

    // 30 days past due → 1–30 bucket
    row = await getRow('2025-03-03') // Feb has 28 days in 2025; 2025-03-03 is 30 days after 02-01
    expect(row.current).toBe(0)
    expect(row['30']).toBe(100)
    expect(row['60']).toBe(0)

    // 31 days past due → 31–60
    row = await getRow('2025-03-04')
    expect(row['30']).toBe(0)
    expect(row['60']).toBe(100)

    // 60 days past due → still 31–60
    row = await getRow('2025-04-02')
    expect(row['60']).toBe(100)
    expect(row['90']).toBe(0)

    // 61 days past due → 61–90
    row = await getRow('2025-04-03')
    expect(row['60']).toBe(0)
    expect(row['90']).toBe(100)

    // 90 days past due → still 61–90
    row = await getRow('2025-05-02')
    expect(row['90']).toBe(100)
    expect(row['120+']).toBe(0)

    // 91 days past due → >90
    row = await getRow('2025-05-03')
    expect(row['90']).toBe(0)
    expect(row['120+']).toBe(100)
  })
})
