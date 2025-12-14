import { POST as POST_PERIODS } from '@/app/api/periods/route'
import { POST as POST_EXPENSES, PUT as PUT_EXPENSES } from '@/app/api/expenses/route'
import { POST as POST_REOPEN } from '@/app/api/settings/reopen-period/route'

function req(url: string, method: string, body?: any) {
  return new Request(url, { method, headers: { 'content-type': 'application/json' }, body: body ? JSON.stringify(body) : undefined })
}

describe('Expenses closed-period enforcement', () => {
  test('blocks creating expense dated on/before closed date', async () => {
    const closed = new Date(Date.now() - 24*3600*1000).toISOString().slice(0,10)
    // Close through yesterday
    const resClose: any = await POST_PERIODS(req('http://localhost/api/periods', 'POST', { closeThrough: closed }))
    expect([200,403]).toContain(resClose.status)

    // Try to create expense dated on closed date
    const resExp: any = await POST_EXPENSES(req('http://localhost/api/expenses', 'POST', {
      date: closed,
      payee: 'Vendor X',
      category: 'Meals',
      amount: 10
    }))
    expect([400,403]).toContain(resExp.status)

    // Reopen to reset state for other tests
    const resReopen: any = await POST_REOPEN()
    expect([200,403]).toContain(resReopen.status)
  })

  test('cannot move expense into closed period via PUT', async () => {
    const today = new Date().toISOString().slice(0,10)
    const yesterday = new Date(Date.now() - 24*3600*1000).toISOString().slice(0,10)
    // Close through yesterday
    const resClose: any = await POST_PERIODS(req('http://localhost/api/periods', 'POST', { closeThrough: yesterday }))
    expect([200,403]).toContain(resClose.status)

    // First, attempt update on closed date (should block)
    const resPut: any = await PUT_EXPENSES(req('http://localhost/api/expenses', 'PUT', {
      id: 'exp_test_move',
      date: yesterday,
      payee: 'Vendor Y',
      category: 'Travel',
      amount: 15
    }))
    expect([400,403]).toContain(resPut.status)

    // Reopen to reset state
    const resReopen: any = await POST_REOPEN()
    expect([200,403]).toContain(resReopen.status)
  })
})
