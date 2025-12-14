import { GET as GET_PSL_JSON } from '@/app/api/reports/product-service-list/route'

const makeReq = (url: string) => new Request(url)

describe('Product/Service List JSON', () => {
  test('returns rows with name and type', async () => {
    const res: any = await GET_PSL_JSON(makeReq('http://localhost/api/reports/product-service-list'))
    expect(res.status).toBe(200)
    const data = await res.json()
    expect(Array.isArray(data.rows)).toBe(true)
    if (data.rows.length) {
      const r = data.rows[0]
      expect(r).toHaveProperty('name')
      expect(r).toHaveProperty('type')
    }
  })

  test('supports q filter', async () => {
    const resAll: any = await GET_PSL_JSON(makeReq('http://localhost/api/reports/product-service-list'))
    const all = await resAll.json()
    const resFiltered: any = await GET_PSL_JSON(makeReq('http://localhost/api/reports/product-service-list?q=Item%201'))
    const filtered = await resFiltered.json()
    expect(filtered.rows.length).toBeLessThanOrEqual(all.rows.length)
    if (filtered.rows.length) {
      expect(filtered.rows.every((r: any) => String(r.name).toLowerCase().includes('item 1'))).toBe(true)
    }
  })
})
