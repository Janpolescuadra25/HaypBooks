import { GET as GET_EMP_CONTACT_JSON } from '@/app/api/reports/employee-contact-list/route'

function makeReq(url: string): Request { return new Request(url) }

describe('Employee Contact List JSON', () => {
  it('returns rows with name, email, phone', async () => {
    const res: any = await GET_EMP_CONTACT_JSON(makeReq('http://localhost/api/reports/employee-contact-list'))
    expect(res.status).toBe(200)
    const data = await res.json()
    expect(Array.isArray(data.rows)).toBe(true)
    if (data.rows.length) {
      const r = data.rows[0]
      expect(r).toHaveProperty('name')
      expect(r).toHaveProperty('email')
      expect(r).toHaveProperty('phone')
    }
  })
})
