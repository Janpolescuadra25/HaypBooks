/**
 * Tests for promise-to-pay transitions: auto-broken, manual keep/broken
 */
import { db } from '../mock/db'

describe('PromiseToPay transitions', () => {
  beforeEach(() => {
    // Reset mock DB promises for each test
    db.promises = []
  })

  it('auto-marks promise as broken after promisedDate', () => {
    const today = new Date().toISOString().slice(0,10)
    const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0,10)
    db.promises.push({
      id: 'ptp1', customerId: 'c1', invoiceIds: [], amount: 100, promisedDate: yesterday, status: 'open', createdAt: today
    })
    // Simulate GET /api/collections/promises
    require('../app/api/collections/promises/route').GET({ url: `http://x?customerId=c1` })
    expect(db.promises[0].status).toBe('broken')
  })

  it('manual keep endpoint sets status to kept', async () => {
    const today = new Date().toISOString().slice(0,10)
    db.promises.push({
      id: 'ptp2', customerId: 'c1', invoiceIds: [], amount: 100, promisedDate: today, status: 'open', createdAt: today
    })
    const { POST } = require('../app/api/collections/promises/[id]/keep/route')
    await POST({}, { params: { id: 'ptp2' } })
    expect(db.promises[0].status).toBe('kept')
  })

  it('manual broken endpoint sets status to broken', async () => {
    const today = new Date().toISOString().slice(0,10)
    db.promises.push({
      id: 'ptp3', customerId: 'c1', invoiceIds: [], amount: 100, promisedDate: today, status: 'open', createdAt: today
    })
    const { POST } = require('../app/api/collections/promises/[id]/broken/route')
    await POST({}, { params: { id: 'ptp3' } })
    expect(db.promises[0].status).toBe('broken')
  })
})
