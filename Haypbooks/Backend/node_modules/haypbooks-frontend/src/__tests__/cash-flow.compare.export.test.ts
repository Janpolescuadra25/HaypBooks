import { GET as GET_EXPORT } from '@/app/api/reports/cash-flow/export/route'

describe('Cash Flow CSV export (compare)', () => {
  it('expands headers and includes -compare in filename when compare=1', async () => {
    const url = 'http://localhost/api/reports/cash-flow/export?period=YTD&compare=1&end=2025-09-04'
    const res = await GET_EXPORT(new Request(url))
    expect(res.status).toBe(200)
    const text = await res.text()
    const lines = text.split('\n')
  const header = (lines[1] || '').split(',').map((s: string) => s.replace(/\"/g,'').replace(/"/g,''))
    expect(header).toEqual([ 'Section', 'Current', 'Previous', 'Delta', 'Percent' ])
    const disp = res.headers.get('Content-Disposition') || ''
    expect(disp).toContain('cash-flow-YTD-compare-asof-2025-09-04')
    expect(res.headers.get('Content-Type') || '').toContain('text/csv')
  })
})
