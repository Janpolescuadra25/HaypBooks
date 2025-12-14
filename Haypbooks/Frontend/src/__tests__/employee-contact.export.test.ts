import { GET as GET_EMP_CONTACT } from '@/app/api/reports/employee-contact-list/export/route'

function makeReq(url: string): Request { return new Request(url) }

describe('Employee Contact List CSV export', () => {
  it('returns CSV with caption, blank line, header and correct filename', async () => {
    const end = '2025-09-07'
    const res: any = await GET_EMP_CONTACT(makeReq(`http://localhost/api/reports/employee-contact-list/export?end=${end}`))
    const body = await res.text()
    const disp = res.headers.get('Content-Disposition') as string
    const lines = body.split(/\r?\n/)
    expect(lines[0]).toContain('As of')
    expect(lines[1]).toBe('')
    expect(lines[2]).toBe('Name,Email,Phone')
    expect(disp).toContain(`employee-contacts-asof-${end}`)
  })
})
