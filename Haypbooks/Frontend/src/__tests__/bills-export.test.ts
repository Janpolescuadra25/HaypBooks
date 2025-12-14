import { GET as BILLS_GET } from '@/app/api/bills/export/route'

function makeReq(url: string): Request { return new Request(url) }

describe('Bills CSV export', () => {
  test('includes As of and filename', async () => {
    const url = 'http://localhost/api/bills/export?end=2025-09-05'
    const res = await BILLS_GET(makeReq(url))
    const body = await (res as any).text()
    const headers = (res as any).headers
    const cd = headers.get('Content-Disposition') as string
    expect(body.split('\n')[0]).toContain('As of')
    expect(cd).toContain('bills-asof-2025-09-05')
  })
})
