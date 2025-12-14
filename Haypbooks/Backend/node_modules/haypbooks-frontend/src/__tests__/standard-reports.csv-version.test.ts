import { GET as GetJson } from '@/app/api/reports/standard/[slug]/route'
import { GET as GetCsv } from '@/app/api/reports/standard/[slug]/export/route'

const makeReq = (path: string) => new Request(`http://test${path}`)

async function callCsv(slug: string, qs?: Record<string, string>) {
  const url = new URL(`http://test/api/reports/standard/${slug}/export`)
  if (qs) Object.entries(qs).forEach(([k, v]) => url.searchParams.set(k, v))
  return GetCsv(makeReq(url.pathname + url.search) as any, { params: { slug } })
}

async function callJson(slug: string, qs?: Record<string, string>) {
  const url = new URL(`http://test/api/reports/standard/${slug}`)
  if (qs) Object.entries(qs).forEach(([k, v]) => url.searchParams.set(k, v))
  return GetJson(makeReq(url.pathname + url.search) as any, { params: { slug } })
}

describe('Standard reports CSV-Version opt-in', () => {
  test('omits CSV-Version by default; header matches JSON columns', async () => {
    const slug = 'retail-sales-by-channel'
    const jsonRes: any = await callJson(slug)
    expect(jsonRes.status).toBe(200)
    const json = await jsonRes.json()

    const csvRes: any = await callCsv(slug)
    expect(csvRes.status).toBe(200)
    const lines = (await csvRes.text()).split(/\r?\n/)
    expect(lines[0].startsWith('CSV-Version')).toBe(false)
    expect(lines[0]).toBe(json.columns.join(','))
  })

  test('includes CSV-Version prelude when flagged; header remains second line', async () => {
    const slug = 'retail-sales-by-channel'
    const jsonRes: any = await callJson(slug)
    const json = await jsonRes.json()

    const csvRes: any = await callCsv(slug, { csvVersion: '1' })
    expect(csvRes.status).toBe(200)
    const lines = (await csvRes.text()).split(/\r?\n/)
    expect(lines[0]).toBe('CSV-Version,1')
    expect(lines[1]).toBe(json.columns.join(','))
  })
})
