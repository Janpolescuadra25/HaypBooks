import { NextRequest } from 'next/server'

import { seedIfNeeded } from '@/mock/db'

function makeReq(url: string) {
  return new NextRequest(url)
}

describe('/api/search route', () => {
  beforeAll(() => { seedIfNeeded() })

  it('returns empty groups for short queries', async () => {
    const { GET } = await import('@/app/api/search/route')
    const req = makeReq('http://test/api/search?q=x')
    const res: any = await GET(req as any)
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.query).toBe('x')
    for (const k of Object.keys(body.groups || {})) {
      expect(body.groups[k].total).toBe(0)
      expect(Array.isArray(body.groups[k].items)).toBe(true)
      expect(body.groups[k].items.length).toBe(0)
    }
  })

  it('matches customers by name', async () => {
    const { GET } = await import('@/app/api/search/route')
    const req = makeReq('http://test/api/search?q=Customer%201')
    const res: any = await GET(req as any)
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.groups.customers.total).toBeGreaterThan(0)
    expect(body.groups.customers.items[0].title).toMatch(/Customer/i)
  })

  it('matches invoices by number', async () => {
    const { GET } = await import('@/app/api/search/route')
    const req = makeReq('http://test/api/search?q=INV-100')
    const res: any = await GET(req as any)
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.groups.invoices.total).toBeGreaterThan(0)
    expect(body.groups.invoices.items.some((it: any) => /INV-/.test(it.title))).toBe(true)
  })

  it('returns no results for non-matching query', async () => {
    const { GET } = await import('@/app/api/search/route')
    const req = makeReq('http://test/api/search?q=__nope__')
    const res: any = await GET(req as any)
    expect(res.status).toBe(200)
    const body = await res.json()
    const groups = body.groups
    const totals = Object.values(groups).map((g: any) => g.total)
    expect(totals.every((t: any) => t === 0)).toBe(true)
  })
})
