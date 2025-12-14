import { GET as TXN_GET } from '@/app/api/transactions/export/route'

function makeReq(url: string): Request { return new Request(url) }

describe('Transactions CSV export', () => {
  test('includes As of and filename', async () => {
    const url = 'http://localhost/api/transactions/export?end=2025-09-04'
    const res = await TXN_GET(makeReq(url))
    const body = await (res as any).text()
    const headers = (res as any).headers
    const cd = headers.get('Content-Disposition') as string
    expect(body.split('\n')[0]).toContain('As of')
    expect(cd).toContain('transactions-asof-2025-09-04')
  })
})
