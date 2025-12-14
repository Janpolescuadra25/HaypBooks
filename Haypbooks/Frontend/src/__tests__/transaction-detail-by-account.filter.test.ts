import { GET as TDBA_GET } from '@/app/api/reports/transaction-detail-by-account/route'

const makeReq = (url: string) => new Request(url)

describe('Transaction Detail by Account filtering', () => {
  test('single account filter returns only that account', async () => {
    const res: any = await TDBA_GET(makeReq('http://localhost/api/reports/transaction-detail-by-account?period=Last2Weeks&account=1000'))
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.rows.length).toBeGreaterThan(0)
    const unique = new Set(body.rows.map((r: any) => r.account.number))
    expect(unique.size).toBe(1)
    expect(unique.has('1000')).toBe(true)
  })

  test('multiple account filters return only those accounts', async () => {
    const res: any = await TDBA_GET(makeReq('http://localhost/api/reports/transaction-detail-by-account?period=Last2Weeks&account=1000&account=2000'))
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.rows.length).toBeGreaterThan(0)
    const unique = new Set(body.rows.map((r: any) => r.account.number))
    for (const num of unique) {
      expect(['1000', '2000']).toContain(num)
    }
  })
})
