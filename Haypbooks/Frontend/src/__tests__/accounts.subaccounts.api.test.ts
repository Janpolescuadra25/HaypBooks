import { GET as ACC_GET, POST as ACC_POST, PUT as ACC_PUT } from '@/app/api/accounts/route'

function makeReq(url: string, init?: RequestInit): Request { return new Request(url, init) }

describe('Accounts API: sub-accounts and detail types', () => {
  test('can create a sub-account with parentNumber and detailType', async () => {
    const createRes: any = await ACC_POST(makeReq('http://test/api/accounts', {
      method: 'POST',
      body: JSON.stringify({ number: '4009', name: 'Online Sales', type: 'Income', parentNumber: '4000', detailType: 'Product Income' })
    }))
    expect(createRes.status).toBe(200)
    const { account } = await createRes.json()
    expect(account.parentId).toBeTruthy()
    expect(account.detailType).toBe('Product Income')

    const listRes: any = await ACC_GET(makeReq('http://test/api/accounts?q=4009'))
    expect(listRes.status).toBe(200)
    const data = await listRes.json()
    expect(data.accounts[0].parentNumber).toBe('4000')
  })

  test('rejects type mismatch between child and parent', async () => {
    const badRes: any = await ACC_POST(makeReq('http://test/api/accounts', {
      method: 'POST',
      body: JSON.stringify({ number: '6019', name: 'Bad Child', type: 'Expense', parentNumber: '4000' })
    }))
    expect(badRes.status).toBe(400)
    const body = await badRes.json()
    expect(String(body.error || '')).toMatch(/Parent account type must match/i)
  })

  test('prevents parent cycle on update', async () => {
    // Create a new expense child of 6000
    const mkChild: any = await ACC_POST(makeReq('http://test/api/accounts', {
      method: 'POST',
      body: JSON.stringify({ number: '6009', name: 'Temp Child', type: 'Expense', parentNumber: '6000' })
    }))
    const { account: child } = await mkChild.json()
    // Find parent 6000 id
    const listRes: any = await ACC_GET(makeReq('http://test/api/accounts?q=6000'))
    const list = await listRes.json()
    const parent = list.accounts.find((a: any) => a.number === '6000')
    expect(parent).toBeTruthy()
    // Attempt to set parent of 6000 -> 6009 (which is currently its child) => cycle
    const upRes: any = await ACC_PUT(makeReq('http://test/api/accounts', {
      method: 'PUT',
      body: JSON.stringify({ id: parent.id, number: parent.number, name: parent.name, type: parent.type, parentNumber: '6009' })
    }))
    expect(upRes.status).toBe(400)
    const body = await upRes.json()
    expect(String(body.error || '')).toMatch(/cycle detected/i)
  })
})
