import { GET as RE_GET } from '@/app/api/reports/retained-earnings/route'
import { GET as RE_CSV } from '@/app/api/reports/retained-earnings/export/route'

function makeReq(url: string): Request { return new Request(url) }

describe('Retained Earnings report', () => {
  test('api returns expected fields', async () => {
    const res = await RE_GET(makeReq('http://localhost/api/reports/retained-earnings?period=YTD&end=2025-09-05')) as any
    expect(res.status).toBe(200)
    const data = await res.json()
    expect(typeof data.beginning).toBe('number')
    expect(typeof data.netIncome).toBe('number')
    expect(typeof data.dividends).toBe('number')
    expect(typeof data.ending).toBe('number')
    expect(data.asOf).toBe('2025-09-05')
  })

  test('csv includes As of and filename', async () => {
    const res = await RE_CSV(makeReq('http://localhost/api/reports/retained-earnings/export?period=YTD&end=2025-09-05')) as any
    const body = await res.text()
    const cd = res.headers.get('Content-Disposition') as string
    expect(body.split('\n')[0]).toContain('As of')
    expect(cd).toContain('retained-earnings-asof-2025-09-05')
  })
})
