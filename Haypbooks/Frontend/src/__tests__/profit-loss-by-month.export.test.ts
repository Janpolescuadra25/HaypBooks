import { GET as GET_CSV } from '@/app/api/reports/profit-loss-by-month/export/route'

const req = (url: string) => new Request(url)

describe('Profit & Loss by Month CSV export', () => {
  it('returns CSV with caption, blank line, header with months and total, and deterministic filename', async () => {
    const end = '2025-03-31'
    const start = '2025-01-01'
    const res: any = await GET_CSV(req(`http://localhost/api/reports/profit-loss-by-month/export?start=${start}&end=${end}&period=Custom`))
    expect(res.status).toBe(200)
    expect(res.headers.get('Content-Type')).toContain('text/csv')
    const disp = res.headers.get('Content-Disposition') || ''
    expect(disp).toContain(`profit-loss-by-month-Custom-asof-${end}`)
    const body = await res.text()
    const lines = body.split(/\r?\n/)
    expect(lines[0]).toContain('2025')
    expect(lines[1]).toBe('')
    expect(lines[2].startsWith('Account,')).toBe(true)
    expect(lines[2]).toContain('Jan')
    expect(lines[2]).toContain('Mar')
    expect(lines[2].endsWith(',Total')).toBe(true)
  })
})
