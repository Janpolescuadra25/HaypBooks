jest.mock('@/lib/rbac-server', () => ({
  getRoleFromCookies: () => 'viewer',
  hasPermission: (_role: string, _perm: string) => false,
}))

import { GET, PUT } from '@/app/api/settings/route'

function makeReq(url: string, init?: RequestInit) {
  return new Request(url, init)
}

describe('Settings API RBAC', () => {
  it('GET denies without read permission', async () => {
    const res: any = await GET()
    expect(res.status).toBe(403)
    const body = await res.json()
    expect(body).toEqual({ error: 'Forbidden' })
  })

  it('PUT denies without write permission', async () => {
    const res: any = await PUT(makeReq('http://localhost/api/settings', { method: 'PUT', body: JSON.stringify({ baseCurrency: 'EUR' }) }))
    expect(res.status).toBe(403)
    const body = await res.json()
    expect(body).toEqual({ error: 'Forbidden' })
  })
})
