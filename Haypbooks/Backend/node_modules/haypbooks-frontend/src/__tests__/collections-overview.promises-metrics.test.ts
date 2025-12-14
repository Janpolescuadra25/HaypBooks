import { seedIfNeeded, db, createInvoice, updateInvoice } from '@/mock/db'
import { GET as COLLECTIONS_GET } from '@/app/api/collections/overview/route'
import { POST as PROMISES_POST } from '@/app/api/collections/promises/route'

describe('Collections Overview — promise-to-pay metrics', () => {
  beforeAll(() => { seedIfNeeded() })

  test('openPromises, nextPromiseDate, and promiseAgingDays reflect current statuses', async () => {
    const today = new Date()
    const todayIso = today.toISOString().slice(0,10)
    const mkIso = (offsetDays: number) => {
      const d = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate() + offsetDays))
      return d.toISOString().slice(0,10)
    }
    // Create a dedicated customer and an open invoice
    const cust = { id: `ptp_test_${Date.now()}`, name: 'PTP Test Customer' }
    db.customers.push(cust as any)
    const inv = createInvoice({ number: 'PTP-1', customerId: cust.id, date: todayIso, lines: [{ description: 'Work', amount: 500 }] })
    updateInvoice(inv.id, { status: 'sent' })

    // Create one future promise (open) and one past-due promise (immediately broken)
    const futureDate = mkIso(5)
    const pastDate = mkIso(-3)
    // Future (open)
    {
      const req = new Request('http://localhost/api/collections/promises', { method: 'POST', body: JSON.stringify({ customerId: cust.id, amount: 100, promisedDate: futureDate, invoiceIds: [inv.id] }), headers: { 'Content-Type': 'application/json' } })
      const res: any = await PROMISES_POST(req as any)
      expect(res.status).toBe(200)
      const json = await res.json()
      expect(json?.promise?.status).toBe('open')
    }
    // Past (broken)
    {
      const req = new Request('http://localhost/api/collections/promises', { method: 'POST', body: JSON.stringify({ customerId: cust.id, amount: 50, promisedDate: pastDate, invoiceIds: [inv.id] }), headers: { 'Content-Type': 'application/json' } })
      const res: any = await PROMISES_POST(req as any)
      expect(res.status).toBe(200)
      const json = await res.json()
      expect(json?.promise?.status).toBe('broken')
    }

    // Fetch collections overview as of today
    const req = new Request('http://localhost/api/collections/overview?asOf=' + todayIso)
    const res: any = await COLLECTIONS_GET(req)
    expect(res.status).toBe(200)
    const { overview } = await res.json()
    const row = overview.rows.find((r: any) => r.customerId === cust.id)
    expect(row).toBeTruthy()
    // openPromises counts only the future/open one
    expect(row.openPromises).toBe(1)
    expect(row.nextPromiseDate).toBe(futureDate)
    // Broken promise aging ~ 3 days (allow exact match)
    expect(row.promiseAgingDays).toBeGreaterThanOrEqual(3)
  })
})
