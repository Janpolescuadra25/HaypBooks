import { GET as VENDORS_GET } from '@/app/api/vendors/export/route'

function makeReq(url: string): Request { return new Request(url) }

describe('Vendors CSV export filename tokens', () => {
  test('includes As of caption and q- token in filename', async () => {
    const url = 'http://localhost/api/vendors/export?end=2025-09-04&q=Supply Co. Intl'
    const res: any = await VENDORS_GET(makeReq(url))
    const body = await res.text()
    const cd = res.headers.get('Content-Disposition') as string

    // Caption row starts with As of
    expect(body.split(/\r?\n/)[0]).toContain('As of')

    // Filename should include as-of date and q- tokenized query
    // Dots are allowed by sanitizeToken; spaces -> dashes
    expect(cd).toContain('vendors-asof-2025-09-04_q-supply-co.-intl')
  })
})
