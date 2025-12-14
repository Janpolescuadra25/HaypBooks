import { GET as AP_DETAIL_GET } from '@/app/api/reports/ap-aging-detail/route'

function makeReq(url: string): Request { return new Request(url) }

/*
  Tests for A/P Aging Detail API as-of behavior and bucket filtering using seeded mock DB data.
*/
describe('A/P Aging Detail API', () => {
  test('as-of uses end date and excludes future-due bills', async () => {
    const res: any = await AP_DETAIL_GET(makeReq('http://localhost/api/reports/ap-aging-detail?period=YTD&end=2025-02-15'))
    expect(res.status).toBe(200)
    const data = await res.json()
    // All rows should have dueDate <= asOf
    for (const r of data.rows) {
      expect(r.dueDate <= data.asOf).toBe(true)
    }
  })

  test('bucket filter returns only rows matching requested bucket', async () => {
    // Choose an as-of where some bills are overdue
    const url = 'http://localhost/api/reports/ap-aging-detail?period=YTD&end=2025-03-15&bucket=30'
    const res: any = await AP_DETAIL_GET(makeReq(url))
    expect(res.status).toBe(200)
    const { rows, asOf } = await res.json()
    const inBucket = (aging: number) => aging === 0 ? 'current' : (aging <= 30 ? '30' : aging <= 60 ? '60' : aging <= 90 ? '90' : '120+')
    for (const r of rows) {
      expect(inBucket(r.aging)).toBe('30')
      expect(r.dueDate <= asOf).toBe(true)
    }
  })
})
