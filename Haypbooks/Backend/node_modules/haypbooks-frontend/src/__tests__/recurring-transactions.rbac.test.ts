import { GET, POST, DELETE } from '@/app/api/recurring-transactions/route'
import { addTemplate } from '@/app/api/recurring-transactions/store'
import { NextRequest } from 'next/server'

// Helper to build a minimal NextRequest-like object acceptable to route handlers.
function makeNextRequest(url: string, init: RequestInit & { role?: string } = {}) {
  const { role = 'viewer', headers = {}, ...rest } = init
  const req = new Request(url, { ...rest, headers: { ...headers, 'x-role': role } }) as any
  // Monkey patch properties accessed by requireRole (headers, cookies) already exist; add cookies.get
  req.cookies = { get: (_: string) => undefined }
  return req as NextRequest
}

describe('Recurring Transactions RBAC', () => {
  let templateId: string
  beforeAll(() => {
    const t = addTemplate({
      kind: 'journal',
      name: 'RBAC Template',
      status: 'active',
      startDate: '2025-01-01',
      frequency: 'monthly',
      lines: [{ description: 'Line', amount: 5 }]
    })
    templateId = t.id
  })

  it('viewer can GET list but cannot POST create', async () => {
    const resList: any = await GET()
    expect(resList.status).toBe(200)

    const resPost: any = await POST(makeNextRequest('http://test/api/recurring-transactions',{ method: 'POST', role: 'viewer', body: JSON.stringify({
      kind: 'journal', name: 'New', status: 'active', startDate: '2025-01-02', frequency: 'monthly', lines: []
    }) }))
    expect(resPost.status).toBe(403)
  })

  it('user can POST create but cannot DELETE', async () => {
    const resPost: any = await POST(makeNextRequest('http://test/api/recurring-transactions',{ method: 'POST', role: 'user', body: JSON.stringify({
      kind: 'journal', name: 'User Created', status: 'active', startDate: '2025-01-03', frequency: 'monthly', lines: []
    }) }))
    expect(resPost.status).toBe(201)

  const resDel: any = await DELETE(makeNextRequest(`http://test/api/recurring-transactions?id=${templateId}`,{ method: 'DELETE', role: 'user' }))
    expect(resDel.status).toBe(403)
  })

  it('admin can DELETE', async () => {
  const resDel: any = await DELETE(makeNextRequest(`http://test/api/recurring-transactions?id=${templateId}`,{ method: 'DELETE', role: 'admin' }))
    expect(resDel.status).toBe(200)
  })
})
