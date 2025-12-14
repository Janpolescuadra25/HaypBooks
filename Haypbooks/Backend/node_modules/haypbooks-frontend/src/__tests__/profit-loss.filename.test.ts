import { GET as PL_EXPORT_GET } from '@/app/api/reports/profit-loss/export/route'

function makeReq(url: string): Request { return new Request(url) }

describe('Profit & Loss CSV export filename tokens', () => {
  test('includes period token before slug and as-of date', async () => {
    const params = new URLSearchParams({
      period: 'YTD',
      end: '2025-03-31'
    })
    const url = `http://localhost/api/reports/profit-loss/export?${params.toString()}`
    const res: any = await PL_EXPORT_GET(makeReq(url))
    const cd = res.headers.get('Content-Disposition') as string

    expect(cd).toContain('profit-loss-YTD-asof-2025-03-31')
    expect(cd).toContain('.csv')
  })

  test('includes compare token when compare=1', async () => {
    const params = new URLSearchParams({
      period: 'YTD',
      end: '2025-03-31',
      compare: '1'
    })
    const url = `http://localhost/api/reports/profit-loss/export?${params.toString()}`
    const res: any = await PL_EXPORT_GET(makeReq(url))
    const cd = res.headers.get('Content-Disposition') as string

    expect(cd).toContain('profit-loss-YTD-compare-asof-2025-03-31')
    expect(cd).toContain('.csv')
  })
})
