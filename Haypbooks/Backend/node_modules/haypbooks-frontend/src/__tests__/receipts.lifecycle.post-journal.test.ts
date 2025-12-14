import { setRoleOverride } from '@/lib/rbac-server'
import { POST as Create } from '@/app/api/receipts/route'
import { POST as ParseId } from '@/app/api/receipts/[id]/parse/route'
import { POST as MatchId } from '@/app/api/receipts/[id]/match/route'
import { POST as PostId } from '@/app/api/receipts/[id]/post/route'
import { db } from '@/mock/db'

/**
 * Verifies that posting a matched receipt creates a journal entry (postedJournalId) and timestamp.
 */
describe('receipts posting creates journal entry', () => {
  let receiptId: string
  beforeAll(async () => { setRoleOverride('admin') })
  afterAll(() => { setRoleOverride(undefined as any) })

  test('parse -> match -> post yields postedJournalId and journal exists', async () => {
    // create
    const createRes: any = await Create(new Request('http://test/api/receipts', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ vendor: 'Journal Link Co', amount: 55.10 }) }) as any)
    const created = await createRes.json()
    receiptId = created.receipt.id
    // parse
    const parseRes: any = await ParseId(new Request(`http://test/api/receipts/${receiptId}/parse`, { method: 'POST' }) as any, { params: { id: receiptId } })
    expect(parseRes.status).toBe(200)
    // match
    const matchRes: any = await MatchId(new Request(`http://test/api/receipts/${receiptId}/match`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ transactionId: 'txn-link' }) }) as any, { params: { id: receiptId } })
    expect(matchRes.status).toBe(200)
    // post
    const postRes: any = await PostId(new Request(`http://test/api/receipts/${receiptId}/post`, { method: 'POST' }) as any, { params: { id: receiptId } })
    expect(postRes.status).toBe(200)
    const posted = await postRes.json()
    expect(posted.receipt.status).toBe('posted')
    expect(posted.receipt.postedJournalId).toBeTruthy()
    expect(posted.receipt.postedAt).toBeTruthy()
    const je = (db.journalEntries || []).find(j => j.id === posted.receipt.postedJournalId)
    expect(je).toBeTruthy()
    // verify journal balanced
    if (je) {
      const debit = je.lines.reduce((s,l)=> s + Number(l.debit||0), 0)
      const credit = je.lines.reduce((s,l)=> s + Number(l.credit||0), 0)
      expect(Math.abs(debit - credit)).toBeLessThan(0.001)
    }
  })
})
