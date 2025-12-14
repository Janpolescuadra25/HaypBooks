import { GET as GET_EXPORT } from '@/app/api/reports/trial-balance/export/route'

const makeReq = (url: string) => new Request(url)

describe('Trial Balance CSV export', () => {
  test('includes caption, correct header, and filename', async () => {
    const originalFetch = globalThis.fetch
    // Mock the JSON API the export route calls internally
    globalThis.fetch = (async () => {
      const payload = {
        rows: [
          { number: '1000', name: 'Cash', debit: 100, credit: 0 },
          { number: '2000', name: 'A/P', debit: 0, credit: 100 },
        ],
        totals: { debit: 100, credit: 100 },
      }
      return new Response(JSON.stringify(payload), { status: 200, headers: { 'Content-Type': 'application/json' } })
    }) as any

    const res: any = await GET_EXPORT(makeReq('http://localhost/api/reports/trial-balance/export?end=2025-09-04'))
    const body = await res.text()
    const disp = res.headers.get('Content-Disposition') as string
    const lines = body.split(/\r?\n/)
    expect(lines[0]).toMatch(/As of|\d{4}-\d{2}-\d{2}/)
    expect(lines[2]).toBe('Account,Name,Debit,Credit')
    expect(disp).toContain('trial-balance-asof-2025-09-04')

    globalThis.fetch = originalFetch!
  })
})
