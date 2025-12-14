import { GET as GET_EMP_PHONE } from '@/app/api/reports/employee-phone-list/export/route'

function makeReq(url: string): Request { return new Request(url) }

describe('Employee Phone List CSV export', () => {
  it('returns CSV with caption, blank line, header and correct filename', async () => {
    const end = '2025-09-07'
    const res: any = await GET_EMP_PHONE(makeReq(`http://localhost/api/reports/employee-phone-list/export?end=${end}`))
    const body = await res.text()
    const disp = res.headers.get('Content-Disposition') as string
    const lines = body.split(/\r?\n/)
    expect(lines[0]).toContain('As of')
    expect(lines[1]).toBe('')
    expect(lines[2]).toBe('Name,Phone')
    expect(disp).toContain(`employee-phones-asof-${end}`)
  })
})
