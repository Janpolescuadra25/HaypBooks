import { GET as GET_EXPORT } from '@/app/api/performance/metrics/export/route'

describe('Performance metrics CSV export', () => {
  test('caption and deterministic filename', async () => {
    const res: any = await GET_EXPORT(new Request('http://localhost/api/performance/metrics/export'))
    expect(res.status).toBe(200)
    const text = await res.text()
    const first = text.split('\n')[0]
    expect(first.startsWith('As of')).toBe(true)
    const cd = res.headers.get('Content-Disposition') || ''
    expect(cd).toContain('performance-metrics-asof-')
    expect(res.headers.get('Content-Type')).toContain('text/csv')
  })

  test('uses explicit end date for filename when provided', async () => {
    const res: any = await GET_EXPORT(new Request('http://localhost/api/performance/metrics/export?period=YTD&end=2024-06-30'))
    expect(res.status).toBe(200)
    const cd = res.headers.get('Content-Disposition') || ''
    expect(cd).toContain('performance-metrics-asof-2024-06-30')
  })

  test('compare mode updates filename and columns', async () => {
    const res: any = await GET_EXPORT(new Request('http://localhost/api/performance/metrics/export?period=YTD&compare=1'))
    expect(res.status).toBe(200)
    const cd = res.headers.get('Content-Disposition') || ''
    expect(cd).toContain('performance-metrics-compare-asof-')
    const text = await res.text()
    const lines = text.trim().split('\n')
    // Header should contain both (Cur) and (Prev)
    const header = lines[1]
    expect(header).toContain('(Cur)')
    expect(header).toContain('(Prev)')
  })
})
