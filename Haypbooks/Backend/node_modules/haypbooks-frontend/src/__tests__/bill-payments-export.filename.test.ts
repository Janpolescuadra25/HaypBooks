import { GET as BP_GET } from '@/app/api/bill-payments/export/route'

function makeReq(url: string): Request { return new Request(url) }

describe('Bill Payments CSV export filename', () => {
  test('includes as-of date when only end is provided', async () => {
    const url = 'http://localhost/api/bill-payments/export?end=2025-09-04'
    const res: any = await BP_GET(makeReq(url) as any)
    const cd = res.headers.get('Content-Disposition') as string
    expect(cd).toContain('bill-payments-asof-2025-09-04')
  })
})
