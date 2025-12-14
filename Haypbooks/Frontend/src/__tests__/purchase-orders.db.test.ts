import { seedIfNeeded, db, createPurchaseOrder, receivePurchaseOrder, closePurchaseOrder } from '@/mock/db'

describe('Purchase Orders DB helpers', () => {
  beforeAll(() => {
    seedIfNeeded()
  })

  test('createPurchaseOrder computes total and starts open', () => {
    const vendorId = db.vendors[0]?.id as string
    expect(vendorId).toBeTruthy()
    const po = createPurchaseOrder({
      vendorId,
      date: '2025-01-15',
      lines: [
        { description: 'Materials', qty: 3, rate: 100 },
        { description: 'Service hours', qty: 2, rate: 75 },
      ],
    })
    expect(po.status).toBe('open')
    expect(po.total).toBe(3 * 100 + 2 * 75)
  expect(db.purchaseOrders?.find(p => p.id === po.id)).toBeTruthy()
  })

  test('receivePurchaseOrder creates bill and closes PO', () => {
    const vendorId = db.vendors[1]?.id as string
    const po = createPurchaseOrder({ vendorId, lines: [{ description: 'Widgets', qty: 4, rate: 50 }] })
    const result = receivePurchaseOrder(po.id, { billNumber: 'BILL-9001', billDate: '2025-01-20', terms: 'Net 30' })
    expect(result.purchaseOrder.status).toBe('closed')
    expect(result.bill).toBeTruthy()
    expect(result.bill.number).toBeTruthy()
    // If custom number provided, bill keeps it
    expect(result.bill.number).toBe('BILL-9001')
    // Bill should exist in db and have expected total
    const found = db.bills.find(b => b.id === result.bill.id)
    expect(found?.total).toBe(4 * 50)
  })

  test('closePurchaseOrder marks PO closed without posting', () => {
    const vendorId = db.vendors[2]?.id as string
    const po = createPurchaseOrder({ vendorId, lines: [{ description: 'CapEx', qty: 1, rate: 999 }] })
    const closed = closePurchaseOrder(po.id)
    expect(closed.status).toBe('closed')
    // Closing again is idempotent
    const closedAgain = closePurchaseOrder(po.id)
    expect(closedAgain.status).toBe('closed')
  })

  test('receiving an already closed PO throws', () => {
    const vendorId = db.vendors[3]?.id as string
    const po = createPurchaseOrder({ vendorId, lines: [{ description: 'Thing', qty: 1, rate: 10 }] })
    closePurchaseOrder(po.id)
    expect(() => receivePurchaseOrder(po.id)).toThrow('PO already closed')
  })
})
