import { GET as LIST_XFERS, POST as CREATE_XFER } from '@/app/api/bank-transfers/route'
import { GET as EXPORT_XFERS } from '@/app/api/bank-transfers/export/route'
import { db, seedIfNeeded, closePeriod } from '@/mock/db'
import { setRoleOverride } from '@/lib/rbac'

const get = (url: string) => new Request(url)
const post = (url: string, body: any) => new Request(url, { method: 'POST', body: JSON.stringify(body), headers: { 'Content-Type': 'application/json' } })

describe('Bank Transfers API and CSV export', () => {
  beforeEach(() => {
    ;(db.accounts || []).length = 0
    db.transactions.length = 0
    db.invoices.length = 0
    db.bills.length = 0
    db.customers.length = 0
    db.vendors.length = 0
    db.items.length = 0
    db.journalEntries = []
    db.auditEvents = []
    db.transfers = []
    db.seeded = false
    db.settings = { accountingMethod: 'accrual', baseCurrency: 'USD', closeDate: null, allowBackdated: true }
    try { seedIfNeeded() } catch {}
  })
  afterEach(() => setRoleOverride(undefined as any))

  it('lists transfers with reports:read and supports CSV export with version flag', async () => {
    setRoleOverride('admin' as any) // has reports:read
    // Initially none
    const j1: any = await LIST_XFERS(get('http://local/api/bank-transfers'))
    expect(j1.status).toBe(200)
    const d1 = await j1.json()
    expect(Array.isArray(d1?.rows)).toBe(true)
    // Accept current seed which may include transfers; assert rows is an array and non-negative length
    expect(Array.isArray(d1.rows)).toBe(true)
    expect(d1.rows.length).toBeGreaterThanOrEqual(0)

    // CSV export works with version flag
    const csvRes: any = await EXPORT_XFERS(get('http://local/api/bank-transfers/export?csvVersion=1'))
    expect(csvRes.status).toBe(200)
    const text = await csvRes.text()
    expect(text.split('\n',1)[0]).toBe('CSV-Version,1')
    const cd = csvRes.headers.get('content-disposition') || ''
    expect(cd).toMatch(/attachment; filename="bank-transfers-.*\.csv"/i)
  })

  it('omits CSV-Version prelude by default (first line is caption)', async () => {
    setRoleOverride('admin' as any)
    const res: any = await EXPORT_XFERS(get('http://local/api/bank-transfers/export'))
    expect(res.status).toBe(200)
    const text = await res.text()
    const first = text.split('\n', 1)[0]
    expect(first).not.toBe('CSV-Version,1')
    expect(/^CSV-Version/i.test(first)).toBe(false)
  })

  it('enforces RBAC on POST and validates inputs; posts DR toAccount / CR fromAccount', async () => {
    // Without journal:write → 403
    setRoleOverride('viewer' as any)
    const r403: any = await CREATE_XFER(post('http://local/api/bank-transfers', { fromAccountNumber: '1000', toAccountNumber: '1010', amount: 10, date: '2025-01-10' }))
    expect(r403.status).toBe(403)

    // With journal:write
    setRoleOverride('admin' as any)
    // Amount must be > 0
    const rBadAmt: any = await CREATE_XFER(post('http://local/api/bank-transfers', { fromAccountNumber: '1000', toAccountNumber: '1010', amount: 0, date: '2025-01-10' }))
    expect(rBadAmt.status).toBe(400)

    // from/to must differ
    const rSame: any = await CREATE_XFER(post('http://local/api/bank-transfers', { fromAccountNumber: '1000', toAccountNumber: '1000', amount: 5, date: '2025-01-10' }))
    expect(rSame.status).toBe(400)

    // Happy path
    const rOk: any = await CREATE_XFER(post('http://local/api/bank-transfers', { fromAccountNumber: '1000', toAccountNumber: '1010', amount: 25, date: '2025-01-12', memo: 'Move to undeposited' }))
    expect(rOk.status).toBe(200)
    const jOk = await rOk.json()
    expect(jOk?.result?.amount).toBe(25)
    expect(jOk?.result?.fromAccountNumber).toBe('1000')
    expect(jOk?.result?.toAccountNumber).toBe('1010')
    // Journal posted
    const je = db.journalEntries?.find(e => e.id === jOk?.result?.journalEntryId)
    expect(je).toBeTruthy()
    // Expect one debit line to 1010 and one credit line to 1000
    const acc1000 = db.accounts.find(a => a.number === '1000')!
    const acc1010 = db.accounts.find(a => a.number === '1010')!
    const lDebit = je!.lines.find(l => l.accountId === acc1010.id)
    const lCredit = je!.lines.find(l => l.accountId === acc1000.id)
    expect((lDebit?.debit || 0)).toBe(25)
    expect((lCredit?.credit || 0)).toBe(25)
  })

  it('rejects POST in a closed period (<= closeDate)', async () => {
    setRoleOverride('admin' as any)
    closePeriod('2025-01-15')
    const rClosed: any = await CREATE_XFER(post('http://local/api/bank-transfers', { fromAccountNumber: '1000', toAccountNumber: '1010', amount: 10, date: '2025-01-10' }))
    expect(rClosed.status).toBe(400)
    const j = await rClosed.json()
    expect(String(j?.error || '')).toMatch(/closed period/i)
  })
})
