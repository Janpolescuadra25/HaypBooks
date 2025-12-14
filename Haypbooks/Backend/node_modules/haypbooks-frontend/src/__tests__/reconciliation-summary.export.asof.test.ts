import { GET } from '@/app/api/reconciliation/summary/export/route'

const makeReq = (url: string) => new Request(url)

describe('Reconciliation Summary export as-of behavior', () => {
  it('uses requested as-of in caption and filename', async () => {
    const asOf = '2025-10-01'
    const res: any = await GET(makeReq(`http://test/api/reconciliation/summary/export?asOf=${asOf}`))
    expect(res.status).toBe(200)
    const disp = res.headers.get('Content-Disposition') || ''
    expect(disp).toContain(`reconciliation-summary-asof-${asOf}`)

    const body = await res.text()
    const lines = body.split(/\r?\n/)
    // First line should be a caption (no CSV-Version by default)
    expect(lines[0]).toContain('As of')
    // Spacer then header follows per route implementation
    expect(lines[1]).toBe('')
    expect(lines[2].startsWith('Status,Count')).toBe(true)
  })
})
