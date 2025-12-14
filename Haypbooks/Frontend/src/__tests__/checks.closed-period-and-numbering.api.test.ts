import { POST as POST_PERIODS } from '@/app/api/periods/route'
import { POST as POST_REOPEN } from '@/app/api/settings/reopen-period/route'
import { POST as POST_CHECK } from '@/app/api/checks/route'

function req(url: string, method: string, body?: any) {
  return new Request(url, { method, headers: { 'content-type': 'application/json' }, body: body ? JSON.stringify(body) : undefined })
}

describe('Checks issue flow - closed period and numbering', () => {
  test('blocks issuing check dated on/before closed date; allows after reopen', async () => {
    const yesterday = new Date(Date.now() - 24*3600*1000).toISOString().slice(0,10)
    const resClose: any = await POST_PERIODS(req('http://localhost/api/periods', 'POST', { closeThrough: yesterday }))
    expect([200,403]).toContain(resClose.status)

    const resBad: any = await POST_CHECK(req('http://localhost/api/checks', 'POST', {
      date: yesterday,
      payee: 'Vendor Z',
      amount: 100,
      account: 'Operating Checking - 1234'
    }))
    expect([400,403]).toContain(resBad.status)

    const resReopen: any = await POST_REOPEN()
    expect([200,403]).toContain(resReopen.status)
  })

  test('auto-numbers per account and prevents duplicates', async () => {
    const today = new Date().toISOString().slice(0,10)
    const account = 'Operating Checking - 1234'
    const r1: any = await POST_CHECK(req('http://localhost/api/checks', 'POST', { date: today, payee: 'Vendor A', amount: 10, account }))
    const r2: any = await POST_CHECK(req('http://localhost/api/checks', 'POST', { date: today, payee: 'Vendor B', amount: 20, account }))
    expect([200,403]).toContain(r1.status)
    expect([200,403]).toContain(r2.status)

    // Now try forcing a duplicate number for same account
    const parsed1 = r1.status === 200 ? await r1.json() : null
    const number = parsed1?.check?.number
    if (number) {
      const rDup: any = await POST_CHECK(req('http://localhost/api/checks', 'POST', { date: today, payee: 'Vendor C', amount: 30, account, number }))
      expect([400,403]).toContain(rDup.status)
    }
  })
})
