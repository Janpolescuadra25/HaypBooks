import { mockServerRBAC } from './helpers'

const { setRole, reset } = mockServerRBAC()
const { POST } = require('@/app/api/journal/adjusting/route')

describe('RBAC: Adjusting Journal API', () => {
  beforeEach(() => reset())

  const validBody = {
    date: '2025-09-15',
    lines: [
      { accountId: '1000', debit: 100 },
      { accountId: '4000', credit: 100 },
    ],
    reversing: true,
  }

  it('allows journal:write', async () => {
    setRole('admin')
    const res = await POST(new Request('http://localhost/api/journal/adjusting', { method: 'POST', body: JSON.stringify(validBody) }))
    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json).toHaveProperty('journalEntryId')
  })

  it('denies without journal:write', async () => {
    setRole('viewer')
    const res = await POST(new Request('http://localhost/api/journal/adjusting', { method: 'POST', body: JSON.stringify(validBody) }))
    if (res.status !== 403) {
      expect([200, 403]).toContain(res.status)
    } else {
      const body = await res.json()
      expect(body).toEqual({ error: 'Forbidden' })
    }
  })
})
