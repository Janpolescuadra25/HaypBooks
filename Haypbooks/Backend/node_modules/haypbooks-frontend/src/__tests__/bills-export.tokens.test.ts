import { GET as BILLS_GET } from '@/app/api/bills/export/route'

function makeReq(url: string): Request { return new Request(url) }

describe('Bills CSV export filename tokens', () => {
  test('includes status- (non-overdue) and tag- tokens when filters are present', async () => {
    const params = new URLSearchParams({
      start: '2025-01-01',
      end: '2025-01-31',
      status: 'open',
      tag: 't:region:east'
    })
    const url = `http://localhost/api/bills/export?${params.toString()}`
    const res: any = await BILLS_GET(makeReq(url))
    const cd = res.headers.get('Content-Disposition') as string

    // sanitizeToken strips ':'
    expect(cd).toContain('bills-2025-01-01_to_2025-01-31_status-open_tag-tregioneast')
  })

  test('does not include status-overdue token (derived filter)', async () => {
    const params = new URLSearchParams({
      start: '2025-01-01',
      end: '2025-01-31',
      status: 'overdue'
    })
    const url = `http://localhost/api/bills/export?${params.toString()}`
    const res: any = await BILLS_GET(makeReq(url))
    const cd = res.headers.get('Content-Disposition') as string

    expect(cd).toContain('bills-2025-01-01_to_2025-01-31')
    expect(cd).not.toContain('status-overdue')
  })
})
