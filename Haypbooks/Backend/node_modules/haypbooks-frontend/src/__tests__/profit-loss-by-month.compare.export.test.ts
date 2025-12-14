import { GET as GET_CSV } from '@/app/api/reports/profit-loss-by-month/export/route'

const req = (url: string) => new Request(url)

describe('Profit & Loss by Month CSV export (compare mode)', () => {
  it('uses tokens-before filename and includes month headers with Total', async () => {
    const end = '2025-06-30'
    const start = '2025-01-01'
    const url = `http://localhost/api/reports/profit-loss-by-month/export?start=${start}&end=${end}&period=Custom&compare=1`
    const res: any = await GET_CSV(req(url))
    expect(res.status).toBe(200)
    const disp = res.headers.get('Content-Disposition') || ''
    // Expect tokens-before: baseSlug-Period-asof-<end>
    expect(disp).toContain(`profit-loss-by-month-Custom-asof-${end}`)
    const body = await res.text()
    const lines = body.split(/\r?\n/)
    expect(lines[0]).toContain('2025')
    expect(lines[1]).toBe('')
    expect(lines[2].startsWith('Account,')).toBe(true)
    expect(lines[2]).toContain('Jan')
    expect(lines[2]).toContain('Jun')
    expect(lines[2].endsWith(',Total')).toBe(true)
  })
})
