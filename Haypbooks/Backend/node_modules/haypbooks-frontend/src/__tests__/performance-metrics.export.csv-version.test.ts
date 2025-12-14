import { GET as GET_EXPORT } from '@/app/api/performance/metrics/export/route'

describe('Performance metrics CSV export — CSV-Version prelude', () => {
  test('default: no CSV-Version row, caption first', async () => {
    const res: any = await GET_EXPORT(new Request('http://localhost/api/performance/metrics/export'))
    expect(res.status).toBe(200)
    const text = await res.text()
    const lines = text.trim().split('\n')
    expect(lines[0].startsWith('As of')).toBe(true)
    // header immediately after caption
    expect(lines[1].startsWith('Metric,')).toBe(true)
  })

  test('opt-in: CSV-Version row appears before caption', async () => {
    const res: any = await GET_EXPORT(new Request('http://localhost/api/performance/metrics/export?csvVersion=1'))
    expect(res.status).toBe(200)
    const text = await res.text()
    const lines = text.trim().split('\n')
    expect(lines[0]).toBe('CSV-Version,1')
    expect(lines[1].startsWith('As of')).toBe(true)
    expect(lines[2].startsWith('Metric,')).toBe(true)
    const cd = res.headers.get('Content-Disposition') || ''
    expect(cd).toContain('performance-metrics-asof-')
  })
})
