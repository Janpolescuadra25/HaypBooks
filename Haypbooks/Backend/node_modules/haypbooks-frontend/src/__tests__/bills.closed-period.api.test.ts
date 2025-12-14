import { POST as POST_PERIODS } from '@/app/api/periods/route'
import { POST as POST_BILLS } from '@/app/api/bills/route'
import { POST as POST_REOPEN } from '@/app/api/settings/reopen-period/route'

function req(url: string, method: string, body?: any) {
  return new Request(url, { method, headers: { 'content-type': 'application/json' }, body: body ? JSON.stringify(body) : undefined })
}

describe('Bills closed-period enforcement', () => {
  test('blocks creating bill dated on/before closed date', async () => {
    const closed = new Date(Date.now() - 24*3600*1000).toISOString().slice(0,10)
    // Close through yesterday
    const resClose: any = await POST_PERIODS(req('http://localhost/api/periods', 'POST', { closeThrough: closed }))
    expect([200,403]).toContain(resClose.status)

    // Try to create bill dated on closed date
    const resBill: any = await POST_BILLS(req('http://localhost/api/bills', 'POST', {
      vendorId: 'v_1',
      billDate: closed,
      items: [{ description: 'Test', amount: 10 }]
    }))
    expect([400,403]).toContain(resBill.status)

    // Reopen to reset state for other tests
    const resReopen: any = await POST_REOPEN()
    expect([200,403]).toContain(resReopen.status)
  })
})
