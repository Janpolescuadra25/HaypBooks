import { setRoleOverride } from '@/lib/rbac-server'
import { POST as Create } from '@/app/api/receipts/route'
import { POST as ParseId } from '@/app/api/receipts/[id]/parse/route'
import { POST as MatchId } from '@/app/api/receipts/[id]/match/route'
import { POST as PostId } from '@/app/api/receipts/[id]/post/route'
import { POST as ConvertId } from '@/app/api/receipts/[id]/expense/route'
import { db } from '@/mock/db'

/**
 * Verifies converting a posted receipt to an expense attaches expenseId and optionally posts adjustment when account differs.
 */
describe('receipts conversion to expense', () => {
  beforeAll(() => { setRoleOverride('admin') })
  afterAll(() => { setRoleOverride(undefined as any) })

  test('post then convert -> expenseId present', async () => {
    // create
    const createRes: any = await Create(new Request('http://test/api/receipts', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ vendor: 'Convert Co', amount: 25.50 }) }) as any)
    const created = await createRes.json()
    const id = created.receipt.id
    // parse
    await ParseId(new Request(`http://test/api/receipts/${id}/parse`, { method: 'POST' }) as any, { params: { id } })
    // match
    await MatchId(new Request(`http://test/api/receipts/${id}/match`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ transactionId: 'txn-conv' }) }) as any, { params: { id } })
  // post
  const postRes: any = await PostId(new Request(`http://test/api/receipts/${id}/post`, { method: 'POST' }) as any, { params: { id } })
    expect(postRes.status).toBe(200)
  const preCount = (db.journalEntries || []).length
    // convert (default account 6000 -> no adjustment journal created)
    const convRes: any = await ConvertId(new Request(`http://test/api/receipts/${id}/expense`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({}) }) as any, { params: { id } })
    expect(convRes.status).toBe(200)
    const converted = await convRes.json()
    expect(converted.receipt.expenseId).toBeTruthy()
    // journal count unchanged when default account equals original
  const postCount = (db.journalEntries || []).length
  expect(postCount).toBe(preCount)
  })

  test('convert with different expense account posts adjustment', async () => {
    const createRes: any = await Create(new Request('http://test/api/receipts', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ vendor: 'Convert Alt', amount: 10.00 }) }) as any)
    const created = await createRes.json()
    const id = created.receipt.id
    await ParseId(new Request(`http://test/api/receipts/${id}/parse`, { method: 'POST' }) as any, { params: { id } })
    await MatchId(new Request(`http://test/api/receipts/${id}/match`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ transactionId: 'txn-conv2' }) }) as any, { params: { id } })
    await PostId(new Request(`http://test/api/receipts/${id}/post`, { method: 'POST' }) as any, { params: { id } })
    const before = (db.journalEntries || []).length
    const convRes: any = await ConvertId(new Request(`http://test/api/receipts/${id}/expense`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ expenseAccountNumber: '6010' }) }) as any, { params: { id } })
    expect(convRes.status).toBe(200)
    const after = (db.journalEntries || []).length
    expect(after).toBe(before + 1)
  })
})
