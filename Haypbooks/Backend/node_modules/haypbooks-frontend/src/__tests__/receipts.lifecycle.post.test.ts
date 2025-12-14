import { setRoleOverride } from '@/lib/rbac-server'
import { POST as Create, DELETE as Delete } from '@/app/api/receipts/route'
import { POST as ParseId } from '@/app/api/receipts/[id]/parse/route'
import { POST as MatchId } from '@/app/api/receipts/[id]/match/route'
import { POST as PostId } from '@/app/api/receipts/[id]/post/route'

/**
 * Verifies end-to-end lifecycle: uploaded -> parsed -> matched -> posted,
 * and that posted receipts cannot be deleted.
 */
describe('receipts lifecycle posting', () => {
  let createdId: string
  beforeEach(async () => {
    setRoleOverride('admin')
    const res: any = await Create(new Request('http://test/api/receipts', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ vendor: 'Post Flow Co', amount: 42.25 }) }) as any)
    const json = await res.json()
    createdId = json.receipt.id
  })
  afterEach(() => { setRoleOverride(undefined as any) })

  test('can parse -> match -> post and then delete is blocked', async () => {
    // parse
    const parseRes: any = await ParseId(new Request(`http://test/api/receipts/${createdId}/parse`, { method: 'POST' }) as any, { params: { id: createdId } })
    expect(parseRes.status).toBe(200)
    // match
    const matchRes: any = await MatchId(new Request(`http://test/api/receipts/${createdId}/match`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ transactionId: 'txn-lifecycle' }) }) as any, { params: { id: createdId } })
    expect(matchRes.status).toBe(200)
    // post
    const postRes: any = await PostId(new Request(`http://test/api/receipts/${createdId}/post`, { method: 'POST' }) as any, { params: { id: createdId } })
    expect(postRes.status).toBe(200)
    const posted = await postRes.json()
    expect(posted.receipt.status).toBe('posted')
    expect(posted.receipt.postedAt).toBeTruthy()

    // Attempt delete -> should be blocked with 400
    const delRes: any = await Delete(new Request(`http://test/api/receipts?id=${createdId}`, { method: 'DELETE' }) as any)
    expect(delRes.status).toBe(400)
  })
})
