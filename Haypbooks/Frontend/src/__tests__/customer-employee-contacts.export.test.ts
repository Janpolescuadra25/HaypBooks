import { GET as GET_CUSTOMER } from '@/app/api/reports/customer-contact-list/export/route'
import { GET as GET_EMPLOYEE } from '@/app/api/reports/employee-contact-list/export/route'

function makeReq(url: string): Request { return new Request(url) }

describe('Customer/Employee contact list CSV exports', () => {
  test('customer contact list includes caption, blank line, header and filename', async () => {
    const end = '2025-09-07'
    const res: any = await GET_CUSTOMER(makeReq(`http://localhost/api/reports/customer-contact-list/export?end=${end}`))
    const body = await res.text()
    const disp = res.headers.get('Content-Disposition') as string
    const lines = body.split(/\r?\n/)
    expect(lines[0]).toContain('As of')
    expect(lines[1]).toBe('')
    expect(lines[2]).toBe('Name,Email,Phone')
    expect(disp).toContain(`customer-contacts-asof-${end}`)
  })

  test('employee contact list includes caption, blank line, header and filename', async () => {
    const end = '2025-09-07'
    const res: any = await GET_EMPLOYEE(makeReq(`http://localhost/api/reports/employee-contact-list/export?end=${end}`))
    const body = await res.text()
    const disp = res.headers.get('Content-Disposition') as string
    const lines = body.split(/\r?\n/)
    expect(lines[0]).toContain('As of')
    expect(lines[1]).toBe('')
    expect(lines[2]).toBe('Name,Email,Phone')
    expect(disp).toContain(`employee-contacts-asof-${end}`)
  })
})
