import { seedIfNeeded, db, createInvoice, updateInvoice } from '@/mock/db'
import { POST as REMINDERS_POST } from '@/app/api/collections/reminders/route'
import { GET as EXPORT_GET } from '@/app/api/collections/overview/export/route'
import { GET as OVERVIEW_GET } from '@/app/api/collections/overview/route'

const makeReq = (url: string, init?: any) => new Request(url, init)

describe('Collections Reminder Throttle & Export', () => {
  beforeAll(()=> { seedIfNeeded() })

  test('reminderCount increments and throttle blocks within 5 days; export returns CSV', async () => {
    const custId = 'throttle_cust'
    db.customers.push({ id: custId, name: 'Throttle Customer' } as any)
    const inv = createInvoice({ number: 'TH1', customerId: custId, date: '2025-03-01', lines: [{ description: 'X', amount: 100 }] })
    updateInvoice(inv.id, { status: 'sent' })

    // First reminders send
    let res: any = await REMINDERS_POST(makeReq('http://localhost/api/collections/reminders', { method: 'POST', body: JSON.stringify({ customerIds: [custId] }) }))
    expect(res.status).toBe(200)
    let body = await res.json()
    const first = body.results.find((r: any)=> r.customerId === custId)
    expect(first.sent).toBeGreaterThan(0)

    // Second attempt same day should throttle (sent stays 0)
    res = await REMINDERS_POST(makeReq('http://localhost/api/collections/reminders', { method: 'POST', body: JSON.stringify({ customerIds: [custId] }) }))
    expect(res.status).toBe(200)
    body = await res.json()
    const second = body.results.find((r: any)=> r.customerId === custId)
    // All invoices should be throttled; sent 0
    expect(second.sent).toBe(0)

    // Overview export CSV
    const today = new Date().toISOString().slice(0,10)
    const ov: any = await OVERVIEW_GET(makeReq('http://localhost/api/collections/overview?asOf=' + today))
    expect(ov.status).toBe(200)
    const exp: any = await EXPORT_GET(makeReq('http://localhost/api/collections/overview/export?asOf=' + today))
    expect(exp.status).toBe(200)
    const csv = await exp.text()
    expect(csv.split('\n')[0]).toContain('Customer,Risk,Open Invoices')
    expect(csv).toContain('Throttle Customer')
  })
})
