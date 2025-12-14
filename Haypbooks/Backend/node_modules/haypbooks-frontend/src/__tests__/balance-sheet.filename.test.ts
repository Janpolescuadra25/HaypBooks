import { GET as BS_EXPORT_GET } from '@/app/api/reports/balance-sheet/export/route'

function makeReq(url: string): Request { return new Request(url) }

describe('Balance Sheet CSV export filename tokens', () => {
  test('includes period token before slug and as-of date', async () => {
    const params = new URLSearchParams({
      period: 'YTD',
      end: '2025-03-31'
    })
    const url = `http://localhost/api/reports/balance-sheet/export?${params.toString()}`
    const res: any = await BS_EXPORT_GET(makeReq(url))
    const cd = res.headers.get('Content-Disposition') as string

    // Expect tokenPosition 'before' with as-of filename pattern
    expect(cd).toContain('balance-sheet-YTD-asof-2025-03-31')
    expect(cd).toContain('.csv')
  })

  test('includes compare token when compare=1', async () => {
    const params = new URLSearchParams({
      period: 'YTD',
      end: '2025-03-31',
      compare: '1'
    })
    const url = `http://localhost/api/reports/balance-sheet/export?${params.toString()}`
    const res: any = await BS_EXPORT_GET(makeReq(url))
    const cd = res.headers.get('Content-Disposition') as string

    // Expect 'YTD-compare' token before slug
    expect(cd).toContain('balance-sheet-YTD-compare-asof-2025-03-31')
    expect(cd).toContain('.csv')
  })
})
