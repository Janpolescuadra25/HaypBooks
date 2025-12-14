import { GET as LIST_GET, POST as CREATE_POST } from '@/app/api/messages/route'
import { GET as GET_ONE, PUT as UPDATE_PUT, DELETE as DELETE_DEL } from '@/app/api/messages/[id]/route'
import { db, seedIfNeeded } from '@/mock/db'
import { setRoleOverride } from '@/lib/rbac-server'

const mk = (url: string, init?: RequestInit) => new Request(url.startsWith('http') ? url : `http://localhost${url}`, { ...(init || {}) })

describe('Message library API (mock)', () => {
  beforeEach(() => { seedIfNeeded(); setRoleOverride(undefined as any); db.messages = db.messages || [] })
  afterEach(() => setRoleOverride(undefined as any))

  test('list returns seeded messages', async () => {
    const res: any = await LIST_GET()
    const body = await res.json()
    expect(Array.isArray(body.messages)).toBe(true)
    // At least one seeded message exists
    expect(body.messages.length).toBeGreaterThanOrEqual(1)
  })

  test('create / get / update / delete cycle', async () => {
    setRoleOverride('admin' as any)
    // create
    const postBody = JSON.stringify({ name: 'X', body: 'Hello there', tags: ['t'] })
    const post: any = await CREATE_POST(mk('/api/messages', { method: 'POST', body: postBody }))
    expect(post.status).toBe(201)
    const created = await post.json()
    expect(created.message).toHaveProperty('id')
    const id = created.message.id

    // get by id
    const getRes: any = await GET_ONE(mk(`/api/messages/${id}`), { params: { id } } as any)
    expect(getRes.status).toBe(200)
    const one = await getRes.json()
    expect(one.message.body).toBe('Hello there')

    // update
    const putRes: any = await UPDATE_PUT(mk(`/api/messages/${id}`, { method: 'PUT', body: JSON.stringify({ body: 'Updated' }) }), { params: { id } } as any)
    expect(putRes.status).toBe(200)
    const putBody = await putRes.json()
    expect(putBody.message.body).toBe('Updated')

    // delete
    const delRes: any = await DELETE_DEL(mk(`/api/messages/${id}`, { method: 'DELETE' }), { params: { id } } as any)
    expect(delRes.status).toBe(200)
    const delBody = await delRes.json()
    expect(delBody.ok).toBe(true)
  })
})
