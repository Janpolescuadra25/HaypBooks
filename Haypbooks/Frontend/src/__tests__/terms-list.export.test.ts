import { GET } from '@/app/api/reports/terms-list/export/route'

function makeReq(url: string): Request { return new Request(url) }

describe('Terms List CSV export', () => {
  test('includes caption, blank line, header and filename', async () => {
    const end = '2025-09-07'
    const res: any = await GET(makeReq(`http://localhost/api/reports/terms-list/export?end=${end}`))
    const body = await res.text()
    const disp = res.headers.get('Content-Disposition') as string
    const lines = body.split(/\r?\n/)
    expect(lines[0]).toContain('As of')
    expect(lines[1]).toBe('')
    expect(lines[2]).toBe('Term')
    expect(disp).toContain(`terms-list-asof-${end}`)
  })
})
