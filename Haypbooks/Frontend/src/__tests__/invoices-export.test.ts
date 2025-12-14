import { GET as INVOICES_GET } from '@/app/api/invoices/export/route'

function makeReq(url: string): Request { return new Request(url) }

describe('Invoices CSV export', () => {
  test('includes As of and filename', async () => {
    const url = 'http://localhost/api/invoices/export?end=2025-09-06'
    const res = await INVOICES_GET(makeReq(url))
    const body = await (res as any).text()
    const headers = (res as any).headers
    const cd = headers.get('Content-Disposition') as string
    expect(body.split('\n')[0]).toContain('As of')
    expect(cd).toContain('invoices-asof-2025-09-06')
  })
})
