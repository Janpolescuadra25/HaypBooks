import { seedIfNeeded, db } from '@/mock/db'
import { mockServerRBAC } from './helpers'

const makeReq = (url: string, init?: RequestInit) => new Request(url, init)

describe('RBAC: bank rules writes require journal:write', () => {
  const rbac = mockServerRBAC()
  // Route handlers will be imported after setting up mocks inside each test
  let RULES_GET: any, RULES_POST: any, RULES_DELETE: any

  beforeEach(async () => {
    if (!db.seeded) seedIfNeeded()
    rbac.setRole('viewer')
    jest.resetModules()
    ;({ GET: RULES_GET, POST: RULES_POST, DELETE: RULES_DELETE } = await import('@/app/api/bank-feeds/rules/route'))
  })

  afterEach(() => {
    rbac.reset()
  })

  it('GET allowed but POST/DELETE forbidden for viewer', async () => {
  const list: any = await RULES_GET()
    expect(list.status).toBe(200)

    const createBody = { name: 'Nope', textIncludes: 'X' }
    const create: any = await RULES_POST(makeReq('http://localhost/api/bank-feeds/rules', { method: 'POST', body: JSON.stringify(createBody) }))
    expect(create.status).toBe(403)

    const del: any = await RULES_DELETE(makeReq('http://localhost/api/bank-feeds/rules?id=r_foo', { method: 'DELETE' }))
    expect(del.status).toBe(403)
  })

  it('manager can POST/DELETE (has journal:write)', async () => {
  rbac.setRole('manager')
  jest.resetModules()
  ;({ GET: RULES_GET, POST: RULES_POST, DELETE: RULES_DELETE } = await import('@/app/api/bank-feeds/rules/route'))
    const body = { name: 'Allowed', textIncludes: 'OK' }
    const create: any = await RULES_POST(makeReq('http://localhost/api/bank-feeds/rules', { method: 'POST', body: JSON.stringify(body) }))
    expect(create.status).toBe(201)
    const j = await create.json()
    const id = j.rule.id
    const del: any = await RULES_DELETE(makeReq('http://localhost/api/bank-feeds/rules?id=' + encodeURIComponent(id), { method: 'DELETE' }))
    expect(del.status).toBe(200)
  })
})
