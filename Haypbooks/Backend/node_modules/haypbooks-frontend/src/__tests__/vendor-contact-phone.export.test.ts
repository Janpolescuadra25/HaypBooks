import { GET as GET_CONTACT } from '@/app/api/reports/vendor-contact-list/export/route'
import { GET as GET_PHONE } from '@/app/api/reports/vendor-phone-list/export/route'

function makeReq(url: string): Request { return new Request(url) }

describe('Vendor contact/phone list CSV exports', () => {
  test('vendor contact list includes caption, blank line, header and filename', async () => {
    const end = '2025-09-07'
    const res: any = await GET_CONTACT(makeReq(`http://localhost/api/reports/vendor-contact-list/export?end=${end}`))
    const body = await res.text()
    const disp = res.headers.get('Content-Disposition') as string
    const lines = body.split(/\r?\n/)
    expect(lines[0]).toContain('As of')
    expect(lines[1]).toBe('')
    expect(lines[2]).toBe('Name,Email,Phone')
    expect(disp).toContain(`vendor-contacts-asof-${end}`)
  })

  test('vendor phone list includes caption, blank line, header and filename', async () => {
    const end = '2025-09-07'
    const res: any = await GET_PHONE(makeReq(`http://localhost/api/reports/vendor-phone-list/export?end=${end}`))
    const body = await res.text()
    const disp = res.headers.get('Content-Disposition') as string
    const lines = body.split(/\r?\n/)
    expect(lines[0]).toContain('As of')
    expect(lines[1]).toBe('')
    expect(lines[2]).toBe('Name,Phone')
    expect(disp).toContain(`vendor-phones-asof-${end}`)
  })
})
