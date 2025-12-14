import { GET as TXN_GET } from '@/app/api/transactions/export/route'

function makeReq(url: string): Request { return new Request(url) }

describe('Transactions CSV export filename tokens', () => {
  test('includes type-, bank-, and tag- tokens when filters are present', async () => {
    const params = new URLSearchParams({
      start: '2025-01-01',
      end: '2025-01-31',
      type: 'Income',
      bankStatus: 'categorized',
      tag: 't:project:alpha'
    })
    const url = `http://localhost/api/transactions/export?${params.toString()}`
    const res: any = await TXN_GET(makeReq(url))
    const cd = res.headers.get('Content-Disposition') as string

    // Note: sanitizeToken removes characters outside [a-z0-9-_.], so ':' is stripped
    expect(cd).toContain('transactions-2025-01-01_to_2025-01-31_type-income_bank-categorized_tag-tprojectalpha')
  })
})
