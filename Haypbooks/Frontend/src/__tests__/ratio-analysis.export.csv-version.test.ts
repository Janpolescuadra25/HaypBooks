/** @jest-environment node */
import { GET as RatioCsv } from '@/app/api/reports/ratio-analysis/export/route'

const makeReq = (url: string) => new Request(url)

describe('Ratio Analysis CSV-Version opt-in', () => {
  beforeAll(() => {
    // Freeze time for deterministic caption/as-of and filename behavior
    jest.useFakeTimers().setSystemTime(new Date('2025-09-14T12:00:00Z'))
  })
  afterAll(() => jest.useRealTimers())

  it('omits CSV-Version by default (no flag)', async () => {
    const res: any = await RatioCsv(makeReq('http://localhost/api/reports/ratio-analysis/export?period=Today'))
    expect(res.status).toBe(200)
    const body = await res.text()
    const first = body.split('\n', 1)[0]
    expect(first.startsWith('CSV-Version')).toBe(false)
  })

  it('includes CSV-Version,1 when opted-in', async () => {
    const res: any = await RatioCsv(makeReq('http://localhost/api/reports/ratio-analysis/export?period=Today&csvVersion=1'))
    expect(res.status).toBe(200)
    const text = await res.text()
    const lines = text.split('\n')
    expect(lines[0]).toBe('CSV-Version,1')
    // Next line should be the caption, then a blank spacer, then header
    expect(lines[1]).toBeTruthy()
    expect(lines[2]).toBe('')
    expect(lines[3]).toBe('Metric,Value,Unit')
  })
})
