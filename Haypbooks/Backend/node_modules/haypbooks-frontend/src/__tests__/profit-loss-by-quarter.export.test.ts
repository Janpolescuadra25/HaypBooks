import { GET as GET_CSV } from '@/app/api/reports/profit-loss-by-quarter/export/route'

const req = (url: string) => new Request(url)

describe('Profit & Loss by Quarter CSV export', () => {
  it('returns CSV with caption, blank line, quarterly header and total, deterministic filename', async () => {
    const end = '2025-06-30'
    const start = '2025-01-01'
    const res: any = await GET_CSV(req(`http://localhost/api/reports/profit-loss-by-quarter/export?start=${start}&end=${end}&period=Custom`))
    expect(res.status).toBe(200)
    expect(res.headers.get('Content-Type')).toContain('text/csv')
    const disp = res.headers.get('Content-Disposition') || ''
    expect(disp).toContain(`profit-loss-by-quarter-Custom-asof-${end}`)
    const body = await res.text()
    const lines = body.split(/\r?\n/)
    expect(lines[0]).toContain('2025')
    expect(lines[1]).toBe('')
    expect(lines[2].startsWith('Account,')).toBe(true)
    expect(lines[2]).toContain('2025 Q1')
    expect(lines[2]).toContain('2025 Q2')
    expect(lines[2].endsWith(',Total')).toBe(true)
  })
})
