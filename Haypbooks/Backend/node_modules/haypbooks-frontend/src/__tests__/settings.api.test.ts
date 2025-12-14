jest.mock('@/lib/rbac-server', () => ({
  getRoleFromCookies: () => 'admin',
  hasPermission: () => true,
}))

import { GET, PUT } from '@/app/api/settings/route'

function makeReq(url: string, init?: RequestInit) {
  return new Request(url, init)
}

describe('Settings API', () => {
  it('reads and updates settings (happy path)', async () => {
    const getRes: any = await GET()
    const getBody = await getRes.json()
    expect(getBody.settings).toBeTruthy()
    const cur = getBody.settings.baseCurrency
    const next = cur === 'USD' ? 'EUR' : 'USD'
    const putRes: any = await PUT(makeReq('http://localhost/api/settings', { method: 'PUT', body: JSON.stringify({ baseCurrency: next }) }))
    const putBody = await putRes.json()
    expect(putBody.settings.baseCurrency).toBe(next)
  })
})
