import { GET as getJson } from '@/app/api/reports/standard/[slug]/route'
import { GET as getCsv } from '@/app/api/reports/standard/[slug]/export/route'
import { NextRequest } from 'next/server'

function makeReq(url: string) {
  return new NextRequest(url)
}

describe('standard reports empty states', () => {
  it('retail report returns zero rows for unknown channel', async () => {
    const req = makeReq('http://test/api/reports/standard/retail-sales-by-channel?channel=__NONE__&period=this-month')
    const res: any = await getJson(req, { params: { slug: 'retail-sales-by-channel' } as any })
    const data = await res.json()
    expect(Array.isArray(data.rows)).toBe(true)
    expect(data.rows.length).toBe(0)
  })

  it('CSV contains only header when no rows', async () => {
    const req = makeReq('http://test/api/reports/standard/retail-sales-by-channel/export?channel=__NONE__&period=this-month')
    const res: any = await getCsv(req, { params: { slug: 'retail-sales-by-channel' } as any })
    const text = await res.text()
    const lines = text.trim().split(/\r?\n/)
    // Allow title and subtitle lines followed by header, but no data lines beyond header
  const headerIndex = lines.findIndex((l: string) => /Channel,Orders,Gross Sales,Discounts,Net Sales/i.test(l))
    expect(headerIndex).toBeGreaterThanOrEqual(0)
    const dataLines = lines.slice(headerIndex + 1)
    // no total row expected when there are zero data rows
    expect(dataLines.length).toBe(0)
  })
})
