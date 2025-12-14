import { GET } from '@/app/api/reports/product-service-list/export/route'

function makeReq(url: string): Request { return new Request(url) }

describe('Product/Service List CSV export', () => {
  test('includes caption, blank line, header and filename', async () => {
    const end = '2025-09-07'
    const res: any = await GET(makeReq(`http://localhost/api/reports/product-service-list/export?end=${end}`))
    const body = await res.text()
    const disp = res.headers.get('Content-Disposition') as string
    const lines = body.split(/\r?\n/)
    expect(lines[0]).toContain('As of')
    expect(lines[1]).toBe('')
    expect(lines[2]).toBe('Name,Type')
    expect(disp).toContain(`product-service-list-asof-${end}`)
  })
})
