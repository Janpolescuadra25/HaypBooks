import { GET } from '@/app/api/reports/pack/export/route'
import { buildCsvFilename, sanitizeToken } from '@/lib/csv'
import { deriveRange } from '@/lib/report-helpers'

function makeReq(url: string): Request { return new Request(url) }

describe('Management pack export filenames (CSV/PDF)', () => {
  it('CSV filename includes period and token (preset)', async () => {
    const name = 'Q1 Snapshot'
    const safeToken = sanitizeToken(name.toLowerCase().replace(/[^a-z0-9\s-]/g, '').trim().replace(/\s+/g, '-').slice(0, 60))
    const expected = buildCsvFilename('management-pack', { period: 'YTD', tokens: [safeToken] })
    const url = `http://localhost/api/reports/pack/export?reports=profit-and-loss,balance-sheet&preset=YTD&name=${encodeURIComponent(name)}`
    const res: any = await GET(makeReq(url))
    expect(res.status).toBe(200)
    expect(res.headers.get('Content-Type')).toContain('text/csv')
    const cd = res.headers.get('Content-Disposition') as string
    expect(cd).toBe(`attachment; filename="${expected}"`)
  })

  it('CSV filename includes Custom range without token', async () => {
    const start = '2025-01-01'
    const end = '2025-03-31'
    const { start: dStart, end: dEnd } = deriveRange('Custom', start, end)
    const expected = buildCsvFilename('management-pack', { period: 'Custom', start: dStart || undefined, end: dEnd || undefined })
    const url = `http://localhost/api/reports/pack/export?reports=profit-and-loss&preset=Custom&start=${start}&end=${end}`
    const res: any = await GET(makeReq(url))
    expect(res.status).toBe(200)
    expect(res.headers.get('Content-Type')).toContain('text/csv')
    const cd = res.headers.get('Content-Disposition') as string
    expect(cd).toBe(`attachment; filename="${expected}"`)
  })

  it('PDF filename mirrors CSV filename with .pdf extension', async () => {
    const name = 'Q1 Snapshot'
    const safeToken = sanitizeToken(name.toLowerCase().replace(/[^a-z0-9\s-]/g, '').trim().replace(/\s+/g, '-').slice(0, 60))
    const csvName = buildCsvFilename('management-pack', { period: 'ThisMonth', tokens: [safeToken] })
    const expectedPdf = csvName.replace(/\.csv$/i, '.pdf')
    const url = `http://localhost/api/reports/pack/export?format=pdf&reports=profit-and-loss&preset=ThisMonth&name=${encodeURIComponent(name)}`
    const res: any = await GET(makeReq(url))
    expect(res.status).toBe(200)
    expect(res.headers.get('Content-Type')).toBe('application/pdf')
    const cd = res.headers.get('Content-Disposition') as string
    expect(cd).toBe(`attachment; filename="${expectedPdf}"`)
  })
})
