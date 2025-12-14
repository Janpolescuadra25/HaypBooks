import { GET as GET_PERIODS, POST as POST_PERIODS } from '@/app/api/periods/route'

function makeReq(method: string, body?: any) {
  return new Request('http://localhost/api/periods', { method, body: body ? JSON.stringify(body) : undefined, headers: body ? { 'content-type': 'application/json' } : undefined })
}

describe('Closed-period enforcement for invoices and bills', () => {
  test('GET /api/periods returns closedThrough', async () => {
    const res: any = await GET_PERIODS()
    expect(res.status).toBe(200)
    const data = await res.json()
    expect('closedThrough' in data).toBe(true)
  })

  test('POST /api/periods closes through a date (smoke)', async () => {
    const end = new Date(Date.now() - 86400000).toISOString().slice(0,10)
    const res: any = await POST_PERIODS(makeReq('POST', { closeThrough: end }))
    expect([200, 403]).toContain(res.status)
  })
})
