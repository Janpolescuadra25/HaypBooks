import { mockApi } from '@/lib/mock-api'

describe('Vendor Statement API', () => {
  it('returns lines, totals, and aging for a vendor as of today', async () => {
    const vendorId = 'ven_1'
    const today = new Date().toISOString().slice(0,10)
    const res: any = await mockApi(`/api/vendors/${vendorId}/statement?asOf=${today}`)
    expect(res).toBeTruthy()
    expect(res.vendorId).toBe(vendorId)
    expect(res.asOf).toBe(today)
    expect(Array.isArray(res.lines)).toBe(true)
    expect(res.totals).toBeTruthy()
    expect(res.aging?.totals).toBeTruthy()
  })
})
