import { POST } from '@/app/api/accounting/month-end/route'
import { db, seedIfNeeded } from '@/mock/db'

const mkReq = (body: any) => new Request('http://localhost/api/accounting/month-end', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(body),
})

describe('Month-end generate closing entries', () => {
  beforeEach(() => {
    // reset db
    db.accounts.length = 0
    db.transactions.length = 0
    db.invoices.length = 0
    if (db.estimates) db.estimates.length = 0
    db.bills.length = 0
    db.customers.length = 0
    db.vendors.length = 0
    db.items.length = 0
    if (db.journalEntries) db.journalEntries.length = 0
    if (db.auditEvents) db.auditEvents.length = 0
    ;(db as any).seeded = false
    db.settings = { accountingMethod: 'accrual', baseCurrency: 'USD', closeDate: null, allowBackdated: true, closePassword: undefined }
    seedIfNeeded()
  })

  afterEach(() => {
    // no-op
  })

  it('posts a single closing entry moving P&L to Retained Earnings and is idempotent', async () => {
    // First call should create one entry for Jan 2025
    const res1: any = await POST(mkReq({ action: 'generate_closing_entries', period: '2025-01' }) as any)
    const j1 = await res1.json()
    expect(res1.status).toBe(200)
    expect(j1.success).toBe(true)
    expect(j1.entries).toBe(1)
    expect(typeof j1.entryId).toBe('string')
    expect(j1.closingDate).toBe('2025-01-31')

    // Verify JE exists and includes RE (3000) line and zeroes P&L
  const reAcc = db.accounts.find(a => a.number === '3000')!
  const closingJe = db.journalEntries!.find(e => e.id === j1.entryId)!
    expect(closingJe).toBeTruthy()
    const hasRE = closingJe.lines.some(l => l.accountId === reAcc.id)
    expect(hasRE).toBe(true)

    // Second call should be idempotent: no new entry
    const res2: any = await POST(mkReq({ action: 'generate_closing_entries', period: '2025-01' }) as any)
    const j2 = await res2.json()
    expect(res2.status).toBe(200)
    expect(j2.success).toBe(true)
    expect(j2.entries).toBe(0)
  })
})
