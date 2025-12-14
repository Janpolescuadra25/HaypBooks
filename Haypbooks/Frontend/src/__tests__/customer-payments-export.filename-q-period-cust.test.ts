import { GET as CP_EXPORT } from '@/app/api/customer-payments/export/route'

function makeReq(url: string): Request { return new Request(url) }

describe('Customer Payments CSV export filename tokens', () => {
  test('includes As of caption and tokens for period/q/cust', async () => {
    const url = 'http://localhost/api/customer-payments/export?period=last-30&q=Widget Co.&customerId=cust_123'
    const res: any = await CP_EXPORT(makeReq(url))
    const body = await res.text()
    const cd = res.headers.get('Content-Disposition') as string

    expect(body.split(/\r?\n/)[0]).toContain('As of')
    // Should include tokens for period, q, customer, in any order (filename starts with prefix)
    expect(cd).toContain('customer-payments-')
    expect(cd).toMatch(/period-last-30/)
    expect(cd).toMatch(/q-widget-co\./)
    expect(cd).toMatch(/cust-cust_123/)
  })

  test('caption and headers correct', async () => {
    const url = 'http://localhost/api/customer-payments/export?end=2025-01-31'
    const res: any = await CP_EXPORT(makeReq(url))
    const body = await res.text()
    const lines = body.split(/\r?\n/)
    expect(lines[0]).toContain('As of')
    expect(lines[1]).toBe('Date,Payment ID,Customer,Received,Allocated,Unapplied,Allocations,Status')
  })
})
