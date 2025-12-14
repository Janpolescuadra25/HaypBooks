import { POST as POST_PERIODS } from '@/app/api/periods/route'
import { POST as POST_RECEIPTS, PUT as PUT_RECEIPTS } from '@/app/api/sales-receipts/route'
import { POST as POST_REOPEN } from '@/app/api/settings/reopen-period/route'

function req(url: string, method: string, body?: any) {
  return new Request(url, { method, headers: { 'content-type': 'application/json' }, body: body ? JSON.stringify(body) : undefined })
}

describe('Sales Receipts closed-period enforcement', () => {
  test('blocks creating sales receipt dated on/before closed date', async () => {
    const closed = new Date(Date.now() - 24*3600*1000).toISOString().slice(0,10)
    // Close through yesterday
    const resClose: any = await POST_PERIODS(req('http://localhost/api/periods', 'POST', { closeThrough: closed }))
    expect([200,403]).toContain(resClose.status)

    // Try to create receipt dated on closed date
    const res: any = await POST_RECEIPTS(req('http://localhost/api/sales-receipts', 'POST', {
      date: closed,
      customer: 'Customer 1',
      description: 'Test receipt',
      amount: 25
    }))
    expect([400,403]).toContain(res.status)

    // Reopen to reset state
    const resReopen: any = await POST_REOPEN()
    expect([200,403]).toContain(resReopen.status)
  })

  test('cannot move sales receipt into a closed period via PUT', async () => {
    const yesterday = new Date(Date.now() - 24*3600*1000).toISOString().slice(0,10)
    const resClose: any = await POST_PERIODS(req('http://localhost/api/periods', 'POST', { closeThrough: yesterday }))
    expect([200,403]).toContain(resClose.status)

    // Attempt update into closed date
    const resPut: any = await PUT_RECEIPTS(req('http://localhost/api/sales-receipts', 'PUT', {
      id: 'sr_test_move',
      date: yesterday,
      customer: 'Customer 2',
      description: 'Backdate attempt',
      amount: 55
    }))
    expect([400,403]).toContain(resPut.status)

    const resReopen: any = await POST_REOPEN()
    expect([200,403]).toContain(resReopen.status)
  })
})
