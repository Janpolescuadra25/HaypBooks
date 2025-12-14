import { GET as GL_EXPORT_GET } from '@/app/api/reports/general-ledger/export/route'

function makeReq(url: string): Request { return new Request(url) }

describe('General Ledger CSV export filename', () => {
  test('uses as-of date from end (legacy/as-of policy)', async () => {
    const params = new URLSearchParams({ end: '2025-03-31' })
    const url = `http://localhost/api/reports/general-ledger/export?${params.toString()}`
    const res: any = await GL_EXPORT_GET(makeReq(url))
    const cd = res.headers.get('Content-Disposition') as string

    expect(cd).toContain('general-ledger-asof-2025-03-31')
    expect(cd).toContain('.csv')
  })
})
