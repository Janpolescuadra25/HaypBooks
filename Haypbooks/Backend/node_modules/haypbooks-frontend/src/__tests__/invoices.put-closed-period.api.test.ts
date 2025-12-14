import { GET as GET_INVOICE, PUT as PUT_INVOICE } from '@/app/api/invoices/[id]/route'
import { POST as POST_INVOICES } from '@/app/api/invoices/route'
import { POST as POST_PERIODS } from '@/app/api/periods/route'
import { POST as POST_REOPEN } from '@/app/api/settings/reopen-period/route'

function req(url: string, method: string, body?: any) {
  return new Request(url, { method, headers: { 'content-type': 'application/json' }, body: body ? JSON.stringify(body) : undefined })
}

async function createSampleInvoice() {
  const res: any = await POST_INVOICES(req('http://localhost/api/invoices', 'POST', { customerId: 'c_1', items: [{ description: 'x', amount: 1 }], date: new Date().toISOString().slice(0,10) }))
  const data = await res.json()
  return data.invoice?.id as string
}

describe('Invoice PUT closed-period enforcement', () => {
  test('cannot move invoice into closed period via PUT', async () => {
    const id = await createSampleInvoice()
    expect(typeof id).toBe('string')

    const closed = new Date().toISOString().slice(0,10)
    const resClose: any = await POST_PERIODS(req('http://localhost/api/periods', 'POST', { closeThrough: closed }))
    expect([200,403]).toContain(resClose.status)

    const resPut: any = await PUT_INVOICE(
      req(`http://localhost/api/invoices/${id}`, 'PUT', { date: closed }),
      { params: { id } }
    )
    expect([400,403]).toContain(resPut.status)

    const resReopen: any = await POST_REOPEN()
    expect([200,403]).toContain(resReopen.status)
  })
})
