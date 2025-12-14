import { GET as TB_GET } from '@/app/api/reports/trial-balance/route'

const makeReq = (u: string) => new Request(u)

describe('Trial Balance period aliasing', () => {
  test('ThisQuarter aliases to QTD and remains balanced', async () => {
    const url = 'http://localhost/api/reports/trial-balance?period=ThisQuarter&end=2025-09-30'
    const res: any = await TB_GET(makeReq(url))
    expect(res.status).toBe(200)
    const data = await res.json()
    expect(data.end).toBe('2025-09-30')
    expect(data.start).toMatch(/^2025-07-0[1-3]$/) // start of quarter
    expect(data.balanced).toBe(true)
  })

  test('ThisMonth aliases to MTD with today anchor when no end', async () => {
    const url = 'http://localhost/api/reports/trial-balance?period=ThisMonth'
    const res: any = await TB_GET(makeReq(url))
    expect(res.status).toBe(200)
    const data = await res.json()
    // end should equal today ISO, start should be first of current month
    const today = new Date()
    const todayIso = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate())).toISOString().slice(0,10)
    expect(data.end).toBe(todayIso)
    const firstOfMonth = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), 1)).toISOString().slice(0,10)
    expect(data.start).toBe(firstOfMonth)
  })
})
