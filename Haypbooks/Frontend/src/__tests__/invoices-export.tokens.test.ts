import { GET as INVOICES_GET } from '@/app/api/invoices/export/route'

function makeReq(url: string): Request { return new Request(url) }

describe('Invoices CSV export filename tokens', () => {
  test('includes tag- token when tag filter provided', async () => {
    const params = new URLSearchParams({
      start: '2025-01-01',
      end: '2025-01-31',
      tag: 't:project:alpha'
    })
    const url = `http://localhost/api/invoices/export?${params.toString()}`
    const res: any = await INVOICES_GET(makeReq(url) as any)
    const cd = res.headers.get('Content-Disposition') as string

    // sanitizeToken strips ':'
    expect(cd).toContain('invoices-2025-01-01_to_2025-01-31_tag-tprojectalpha')
  })
})
