import { GET as CUSTOMERS_GET } from '@/app/api/customers/export/route'

function makeReq(url: string): Request { return new Request(url) }

describe('Customers CSV export filename tokens', () => {
  test('includes As of caption and q- token in filename', async () => {
    const url = 'http://localhost/api/customers/export?end=2025-09-04&q=Acme Widgets'
    const res: any = await CUSTOMERS_GET(makeReq(url))
    const body = await res.text()
    const cd = res.headers.get('Content-Disposition') as string

    // Caption row starts with As of
    expect(body.split(/\r?\n/)[0]).toContain('As of')

    // Filename should include as-of date and q- tokenized query
    expect(cd).toContain('customers-asof-2025-09-04_q-acme-widgets')
  })
})
