import { seedIfNeeded, db } from '@/mock/db'
import { GET as RULES_GET, POST as RULES_POST, DELETE as RULES_DELETE } from '@/app/api/bank-feeds/rules/route'

const makeReq = (url: string, init?: RequestInit) => new Request(url, init)

describe('Bank rules manage API', () => {
  beforeEach(() => {
    if (!db.seeded) seedIfNeeded()
  })

  test('list, create, delete rule', async () => {
    const list1: any = await RULES_GET()
    expect(list1.status).toBe(200)
    const j1 = await list1.json()
    const startCount = Array.isArray(j1.rules) ? j1.rules.length : 0

    const body = { name: 'Auto $9 coffee => Expense', textIncludes: 'COFFEE', amountEquals: 9, setCategory: 'Expense', setStatus: 'categorized' }
    const create: any = await RULES_POST(makeReq('http://localhost/api/bank-feeds/rules', { method: 'POST', body: JSON.stringify(body) }))
    expect(create.status).toBe(201)
    const j2 = await create.json()
    expect(j2.rule).toBeDefined()
    expect(j2.rule.name).toBe(body.name)

    const list2: any = await RULES_GET()
    const j3 = await list2.json()
    expect(j3.rules.length).toBe(startCount + 1)

    const del: any = await RULES_DELETE(makeReq('http://localhost/api/bank-feeds/rules?id=' + encodeURIComponent(j2.rule.id), { method: 'DELETE' }))
    expect(del.status).toBe(200)
    const j4 = await del.json()
    expect(j4.ok).toBe(true)

    const list3: any = await RULES_GET()
    const j5 = await list3.json()
    const afterCount = Array.isArray(j5.rules) ? j5.rules.length : 0
    expect(afterCount).toBe(startCount)
  })
})
