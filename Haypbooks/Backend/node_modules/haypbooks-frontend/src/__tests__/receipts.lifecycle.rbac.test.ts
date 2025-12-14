import { setRoleOverride } from '@/lib/rbac-server'
import { GET as List, POST as Create, DELETE as Delete } from '@/app/api/receipts/route'
import { findReceipt, mutateReceipt } from '@/app/api/receipts/store'
import { POST as ParseId } from '@/app/api/receipts/[id]/parse/route'
import { POST as MatchId } from '@/app/api/receipts/[id]/match/route'

describe('receipts lifecycle & RBAC', () => {
  let createdId: string
  beforeEach(async () => {
    setRoleOverride('admin')
    const res: any = await Create(new Request('http://test/api/receipts', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ vendor: 'Lifecycle Vendor', amount: 55.10 }) }) as any)
    const json = await res.json()
    createdId = json.receipt.id
  })
  afterEach(() => { setRoleOverride(undefined as any) })

  test('viewer can read but not mutate', async () => {
    setRoleOverride('viewer')
    const listRes: any = await List(new Request('http://test/api/receipts') as any)
    expect(listRes.status).toBe(200)
    const createRes: any = await Create(new Request('http://test/api/receipts', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ vendor: 'X', amount: 1 }) }) as any)
    expect(createRes.status).toBe(403)
    const parseRes: any = await ParseId(new Request(`http://test/api/receipts/${createdId}/parse`, { method: 'POST' }) as any, { params: { id: createdId } })
    expect(parseRes.status).toBe(403)
  })

  test('parse transitions uploaded->parsed and match transitions parsed->matched', async () => {
    setRoleOverride('admin')
    const parseRes: any = await ParseId(new Request(`http://test/api/receipts/${createdId}/parse`, { method: 'POST' }) as any, { params: { id: createdId } })
    expect(parseRes.status).toBe(200)
    const parsed = await parseRes.json()
    expect(parsed.receipt.status).toBe('parsed')
    const matchRes: any = await MatchId(new Request(`http://test/api/receipts/${createdId}/match`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ transactionId: 'txn-999' }) }) as any, { params: { id: createdId } })
    expect(matchRes.status).toBe(200)
    const matched = await matchRes.json()
    expect(matched.receipt.status).toBe('matched')
    expect(matched.receipt.matchedTransactionId).toBe('txn-999')
  })

  test('cannot delete posted receipt', async () => {
    setRoleOverride('admin')
    // Force status to posted via inline mutation (simulating future post action)
    // Call inline parse/match handlers to ensure they operate; then manually set status posted
  await MatchId(new Request(`http://test/api/receipts/${createdId}/match`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ transactionId: 'txn-abc' }) }) as any, { params: { id: createdId } })
  mutateReceipt(createdId, (r) => { (r as any).status = 'posted' })
    // Attempt delete
    const delRes: any = await Delete(new Request(`http://test/api/receipts?id=${createdId}`, { method: 'DELETE' }) as any)
    expect(delRes.status).toBe(400)
    const delJson = await delRes.json()
    expect(delJson.error).toMatch(/Cannot delete posted/i)
  })
})
