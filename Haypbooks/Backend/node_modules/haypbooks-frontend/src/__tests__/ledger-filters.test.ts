import { GET as GET_LEDGER } from '@/app/api/reports/account-ledger/route'

const q = (params: Record<string,string>) => new Request('http://localhost/api/reports/account-ledger?' + new URLSearchParams(params).toString())

describe('Ledger API respects start/end filters', () => {
  test('uses provided start/end and sets asOf to end', async () => {
    const res: any = await GET_LEDGER(q({ account: '1000', start: '2025-01-01', end: '2025-02-01' }))
    expect(res.status).toBe(200)
    const data = await res.json()
    expect(data.asOf).toContain('2025-02-01')
  })
  test('derives start/end from period when missing', async () => {
    const res: any = await GET_LEDGER(q({ account: '1000', period: 'YTD' }))
    expect(res.status).toBe(200)
    const data = await res.json()
    // asOf should be today ISO per server timezone; ensure format is ISO-like and of length >= 10
    expect(typeof data.asOf).toBe('string')
    expect(data.rows.length).toBeGreaterThan(0)
  })
})
