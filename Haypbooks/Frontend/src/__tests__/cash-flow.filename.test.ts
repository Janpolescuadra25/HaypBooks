import { GET as CF_EXPORT_GET } from '@/app/api/reports/cash-flow/export/route'

function makeReq(url: string): Request { return new Request(url) }

describe('Cash Flow CSV export filename tokens', () => {
  test('includes period token before slug and as-of date', async () => {
    const params = new URLSearchParams({
      period: 'YTD',
      end: '2025-03-31'
    })
    const url = `http://localhost/api/reports/cash-flow/export?${params.toString()}`
    const res: any = await CF_EXPORT_GET(makeReq(url))
    const cd = res.headers.get('Content-Disposition') as string

    expect(cd).toContain('cash-flow-YTD-asof-2025-03-31')
    expect(cd).toContain('.csv')
  })

  test('includes compare token when compare=1', async () => {
    const params = new URLSearchParams({
      period: 'YTD',
      end: '2025-03-31',
      compare: '1'
    })
    const url = `http://localhost/api/reports/cash-flow/export?${params.toString()}`
    const res: any = await CF_EXPORT_GET(makeReq(url))
    const cd = res.headers.get('Content-Disposition') as string

    expect(cd).toContain('cash-flow-YTD-compare-asof-2025-03-31')
    expect(cd).toContain('.csv')
  })
})
