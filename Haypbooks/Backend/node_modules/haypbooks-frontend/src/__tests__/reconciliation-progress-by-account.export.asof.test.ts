import { GET } from '@/app/api/reconciliation/progress-by-account/export/route'

const makeReq = (url: string) => new Request(url)

describe('Reconciliation Progress-by-Account export as-of behavior', () => {
  it('uses requested as-of in caption and filename', async () => {
    const asOf = '2025-10-01'
    const res: any = await GET(makeReq(`http://test/api/reconciliation/progress-by-account/export?asOf=${asOf}`))
    expect(res.status).toBe(200)
    const disp = res.headers.get('Content-Disposition') || ''
    expect(disp).toContain(`reconciliation-progress-by-account-asof-${asOf}`)

    const body = await res.text()
    const lines = body.split(/\r?\n/)
    // First line should be caption (no CSV-Version by default)
    expect(lines[0]).toContain('As of')
    // Spacer then header row
    expect(lines[1]).toBe('')
    expect(lines[2].startsWith('Account Number,Account Name')).toBe(true)
  })
})
