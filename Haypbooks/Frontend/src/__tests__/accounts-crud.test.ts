import { GET, POST, PUT, DELETE } from '@/app/api/accounts/route'

const makeReq = (method: string, body?: any) => new Request('http://localhost/api/accounts', { method, body: body ? JSON.stringify(body) : undefined, headers: body ? { 'content-type': 'application/json' } : undefined })

describe('Accounts CRUD', () => {
  test('GET returns accounts', async () => {
    const res: any = await GET(new Request('http://localhost/api/accounts'))
    expect(res.status).toBe(200)
  })

  test('POST creates, PUT updates, DELETE removes (per RBAC may be 403)', async () => {
    const create: any = await POST(makeReq('POST', { number: '1999', name: 'Temp Account', type: 'Asset' }))
    expect([200, 403]).toContain(create.status)
    if (create.status === 200) {
      const data = await create.json()
      const id = data.account.id
      const upd: any = await PUT(makeReq('PUT', { id, name: 'Temp Account Updated' }))
      expect(upd.status).toBe(200)
      const del: any = await DELETE(makeReq('DELETE', { id }))
      expect(del.status).toBe(200)
    }
  })
})
