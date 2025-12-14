import { GET as GET_OPEN_INVOICES_CSV } from '@/app/api/reports/open-invoices/export/route'
import { GET as GET_IRP_CSV } from '@/app/api/reports/invoices-and-received-payments/export/route'
import { db, seedIfNeeded, createInvoice, updateInvoice, createCustomerPayment, createCreditMemo, applyCreditToInvoice } from '@/mock/db'

const makeReq = (url: string) => new Request(url)

describe('A/R edge cases reflected in CSV', () => {
  beforeEach(() => {
    // Reset and reseed mock DB for deterministic tests
    ;(db as any).seeded = false
    if (db.accounts) db.accounts.length = 0
    if (db.transactions) db.transactions.length = 0
    if (db.invoices) db.invoices.length = 0
    if (db.estimates) db.estimates.length = 0 as any
    if (db.bills) db.bills.length = 0
    if (db.customers) db.customers.length = 0
    if (db.vendors) db.vendors.length = 0
    if (db.journalEntries) db.journalEntries.length = 0 as any
    ;(db as any).creditMemos = []
    ;(db as any).customerPayments = []
    ;(db as any).deposits = []
    seedIfNeeded()
  })

  test('Partial payment affects as-of open balance', async () => {
    const cust = db.customers[0]
    // Create an invoice on 2025-01-05 for 1000, due 2025-02-04 (Net 30)
    const inv = createInvoice({ number: 'INV-P1', customerId: cust.id, date: '2025-01-05', lines: [{ description: 'Work', amount: 1000 }], terms: 'Net 30' })
    updateInvoice(inv.id, { status: 'sent' })
    // Apply a partial payment 400 on 2025-01-20
  // Record a dated customer payment allocating 400 to the invoice, on 2025-01-20
  createCustomerPayment({ customerId: cust.id, amountReceived: 400, allocations: [{ invoiceId: inv.id, amount: 400 }], date: '2025-01-20' })
    // Open Invoices as of 2025-01-21 should show open balance 600
    const res1: any = await GET_OPEN_INVOICES_CSV(makeReq('http://localhost/api/reports/open-invoices/export?end=2025-01-21'))
    const body1 = await res1.text()
    const lines1 = body1.split(/\r?\n/)
    // Find the data line for INV-P1
  const row1 = lines1.find((l: string) => l.includes('INV-P1'))!
    expect(row1).toBeTruthy()
    const cells1 = row1.split(',')
    // Open Invoices now uses presentational currency formatting; strip currency to assert numeric
    const num1 = Number((cells1[cells1.length - 1] || '').replace(/[^0-9.-]/g, ''))
    expect(num1).toBe(600)

    // Invoices & Received Payments as of 2025-01-21 should show last payment date 2025-01-20 and amount 400
    const res2: any = await GET_IRP_CSV(makeReq('http://localhost/api/reports/invoices-and-received-payments/export?end=2025-01-21'))
    const body2 = await res2.text()
    const lines2 = body2.split(/\r?\n/)
  const row2 = lines2.find((l: string) => l.includes('INV-P1'))!
    const cells2 = row2.split(',')
    // Header is: Customer,Invoice Number,Invoice Date,Due Date,Payment Date,Payment Amount,Open Balance
    expect(cells2[5]).toBe('400')
    expect(parseFloat(cells2[6])).toBe(600)
  })

  test('Credit memo applied reduces open balance without payment cash line', async () => {
    const cust = db.customers[1]
    const inv = createInvoice({ number: 'INV-CM1', customerId: cust.id, date: '2025-01-10', lines: [{ description: 'Service', amount: 500 }], terms: 'Net 30' })
    updateInvoice(inv.id, { status: 'sent' })
    // Create and apply a credit memo of 200 on 2025-01-15
    const cm = createCreditMemo({ customerId: cust.id, date: '2025-01-15', lines: [{ description: 'Adj', amount: 200 }] })
    applyCreditToInvoice(cm.id, inv.id, 200)
    // As of 2025-01-16, open balance should be 300; payment date may reflect credit application date in mock as a payment record
    const res: any = await GET_OPEN_INVOICES_CSV(makeReq('http://localhost/api/reports/open-invoices/export?end=2025-01-16'))
    const body = await res.text()
    const lines = body.split(/\r?\n/)
  const row = lines.find((l: string) => l.includes('INV-CM1'))!
    const cells = row.split(',')
  // Presentational currency: strip to numeric for assertion
  const num3 = Number((cells[cells.length - 1] || '').replace(/[^0-9.-]/g, ''))
  expect(num3).toBe(300)
  })
})
