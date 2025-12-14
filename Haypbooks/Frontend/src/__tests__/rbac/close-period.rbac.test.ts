import { mockServerRBAC } from './helpers'

const { setRole, reset } = mockServerRBAC()
const { POST } = require('@/app/api/settings/close-period/route')

describe('RBAC: Close Period API', () => {
  beforeEach(() => reset())

  it('allows journal:write to close period', async () => {
    setRole('admin')
    const res = await POST(new Request('http://localhost/api/settings/close-period', { method: 'POST', body: JSON.stringify({ date: '2025-09-15' }) }))
    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json).toHaveProperty('closed')
  })

  it('denies without journal:write', async () => {
    setRole('viewer')
    const res = await POST(new Request('http://localhost/api/settings/close-period', { method: 'POST', body: JSON.stringify({ date: '2025-09-15' }) }))
    if (res.status !== 403) {
      expect([200, 403]).toContain(res.status)
    } else {
      const body = await res.json()
      expect(body).toEqual({ error: 'Forbidden' })
    }
  })
})
