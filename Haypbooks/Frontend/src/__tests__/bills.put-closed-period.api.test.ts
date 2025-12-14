import { GET as GET_BILL, PUT as PUT_BILL } from '@/app/api/bills/[id]/route'
import { POST as POST_BILLS } from '@/app/api/bills/route'
import { POST as POST_PERIODS } from '@/app/api/periods/route'
import { POST as POST_REOPEN } from '@/app/api/settings/reopen-period/route'

function req(url: string, method: string, body?: any) {
  return new Request(url, { method, headers: { 'content-type': 'application/json' }, body: body ? JSON.stringify(body) : undefined })
}

async function createSampleBill() {
  const res: any = await POST_BILLS(req('http://localhost/api/bills', 'POST', { vendorId: 'v_1', items: [{ description: 'x', amount: 1 }], billDate: new Date().toISOString().slice(0,10) }))
  const data = await res.json()
  return data.bill?.id as string
}

describe('Bill PUT closed-period enforcement', () => {
  test('cannot move bill into closed period via PUT', async () => {
    const id = await createSampleBill()
    expect(typeof id).toBe('string')

    const closed = new Date().toISOString().slice(0,10)
    const resClose: any = await POST_PERIODS(req('http://localhost/api/periods', 'POST', { closeThrough: closed }))
    expect([200,403]).toContain(resClose.status)

    const resPut: any = await PUT_BILL(
      req(`http://localhost/api/bills/${id}`, 'PUT', { billDate: closed }),
      { params: { id } }
    )
    expect([400,403]).toContain(resPut.status)

    const resReopen: any = await POST_REOPEN()
    expect([200,403]).toContain(resReopen.status)
  })
})
