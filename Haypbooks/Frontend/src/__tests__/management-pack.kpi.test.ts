import { GET } from '@/app/api/reports/pack/export/route'

function makeReq(url: string): Request { return new Request(url) }

describe('Management pack export includes KPI section', () => {
  test('CSV contains KPI header and DSO/DPO rows', async () => {
    const url = 'http://localhost/api/reports/pack/export?reports=profit-and-loss,balance-sheet&preset=YTD&name=Q1 Snapshot'
    const res: any = await GET(makeReq(url))
    expect(res.status).toBe(200)
    const text = await res.text()
    expect(text).toContain('KPI,Value')
    expect(text).toMatch(/DSO \(days\),/)
    expect(text).toMatch(/DPO \(days\),/)
    expect(text).toMatch(/AR open balance,/)
    expect(text).toMatch(/AP open balance,/)
    expect(text).toMatch(/GL balanced,/)
    expect(text).toMatch(/Net margin \(%\),/)
    // Filter metadata
    expect(text).toMatch(/As of,\d{4}-\d{2}-\d{2}/)
    expect(text).toMatch(/Period Start,\d{4}-\d{2}-\d{2}/)
    expect(text).toMatch(/Period End,\d{4}-\d{2}-\d{2}/)
  })
})
