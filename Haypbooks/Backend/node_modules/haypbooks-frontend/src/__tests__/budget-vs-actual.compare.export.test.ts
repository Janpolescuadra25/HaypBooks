import { GET as GET_EXPORT } from '@/app/api/reports/budget-vs-actual/export/route'

function headersToRecord(h: Headers) {
  const rec: Record<string, string> = {}
  h.forEach((v, k) => { rec[k.toLowerCase()] = v })
  return rec
}

describe('Budget vs Actual CSV export (compare)', () => {
  it('expands headers and includes -compare in filename when compare=1', async () => {
    const url = 'http://localhost/api/reports/budget-vs-actual/export?period=Today&compare=1'
    const res = await GET_EXPORT(new Request(url))
    expect(res.status).toBe(200)
    const text = await res.text()
    const lines = text.split('\n')
    // Header row (3rd line) should have expanded compare columns
  const header = (lines[2] || '').split(',').map(s => s.replace(/\"/g,'').replace(/"/g,''))
    expect(header).toEqual([
      'Account',
      'Budgeted (Cur)', 'Budgeted (Prev)', 'Budgeted Δ', 'Budgeted %',
      'Actual (Cur)', 'Actual (Prev)', 'Actual Δ', 'Actual %',
    ])
    const headers = headersToRecord(res.headers)
    const disp = headers['content-disposition']
    expect(disp).toContain('budget-vs-actual-compare-asof-')
    expect(headers['content-type']).toContain('text/csv')
  })
})
