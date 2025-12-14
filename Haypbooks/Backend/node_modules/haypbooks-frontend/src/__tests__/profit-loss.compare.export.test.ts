import { GET as GET_EXPORT } from '@/app/api/reports/profit-loss/export/route'

function headersToRecord(h: Headers) {
  const rec: Record<string, string> = {}
  h.forEach((v, k) => { rec[k.toLowerCase()] = v })
  return rec
}

describe('Profit & Loss CSV export (compare)', () => {
  it('expands headers and includes -compare in filename when compare=1', async () => {
    const url = 'http://localhost/api/reports/profit-loss/export?period=YTD&compare=1&end=2025-09-04'
    const res = await GET_EXPORT(new Request(url))
    expect(res.status).toBe(200)
    const text = await res.text()
    const lines = text.split('\n')
  const header = (lines[1] || '').split(',').map((s: string) => s.replace(/\"/g,'').replace(/"/g,''))
    expect(header).toEqual([
      'Account', 'Current', 'Previous', 'Delta', 'Percent'
    ])
    const headers = headersToRecord(res.headers)
    const disp = headers['content-disposition']
    expect(disp).toContain('profit-loss-YTD-compare-asof-2025-09-04')
    expect(headers['content-type']).toContain('text/csv')
  })
})
