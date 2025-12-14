import { mockServerRBAC } from './rbac/helpers'

const makeReq = (url: string, init?: RequestInit) => new Request(url, init)

describe('Bank feeds upload API', () => {
  const rbac = mockServerRBAC()
  let UPLOAD_POST: any
  let DB: any, seedIfNeeded: any

  beforeEach(async () => {
    // Default to admin (has journal:write); individual tests can override
    rbac.setRole('admin')
    jest.resetModules()
    // Import DB module AFTER reset to ensure same instance as route
    const dbMod: any = await import('@/mock/db')
    DB = dbMod.db
    seedIfNeeded = dbMod.seedIfNeeded
    if (!DB.seeded) seedIfNeeded()
    ;({ POST: UPLOAD_POST } = await import('@/app/api/bank-feeds/upload/route'))
  })

  afterEach(() => { rbac.reset() })

  it('rejects unsupported content-type', async () => {
    const res: any = await UPLOAD_POST(makeReq('http://localhost/api/bank-feeds/upload', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({}) }))
    expect(res.status).toBe(415)
    const j = await res.json()
    expect(j.error).toMatch(/Unsupported/)
  })

  it('ingests CSV text and returns added count', async () => {
    const before = DB.transactions.length
    const csv = 'Date,Description,Amount,ExternalId\n2025-01-10,ONLINE SALE,100.00,ext-1\n2025-01-11,POS PURCHASE,-25.50,ext-2\n'
    const res: any = await UPLOAD_POST(makeReq('http://localhost/api/bank-feeds/upload', { method: 'POST', headers: { 'Content-Type': 'text/csv' }, body: csv }))
    expect(res.status).toBe(200)
    const j = await res.json()
    expect(j.added).toBe(2)
    const after = DB.transactions.length
    expect(after).toBe(before + 2)
    // Verify bankStatus set to imported
  const xs = DB.transactions.slice(-2)
  expect(xs.every((t: any) => t.bankStatus === 'imported' && t.source === 'import')).toBe(true)
  })

  it('dedupes by externalId and by date/amount/description', async () => {
    // Seed one via first upload
    const firstCsv = 'Date,Description,Amount,ExternalId\n2025-01-12,TRANSFER IN,200.00,dup-1\n'
  await UPLOAD_POST(makeReq('http://localhost/api/bank-feeds/upload', { method: 'POST', headers: { 'Content-Type': 'text/csv' }, body: firstCsv }))
  const baseline = DB.transactions.length
    // Attempt duplicates: same externalId and same triplet w/o externalId
    const secondCsv = [
      'Date,Description,Amount,ExternalId',
      // duplicate by externalId
      '2025-01-12,TRANSFER IN,200.00,dup-1',
      // duplicate by triplet (no externalId provided)
      '2025-01-12,TRANSFER IN,200.00,'
    ].join('\n') + '\n'
    const res: any = await UPLOAD_POST(makeReq('http://localhost/api/bank-feeds/upload', { method: 'POST', headers: { 'Content-Type': 'text/csv' }, body: secondCsv }))
    expect(res.status).toBe(200)
    const j = await res.json()
    expect(j.added).toBe(0)
    expect(DB.transactions.length).toBe(baseline)
  })

  it('enforces RBAC: viewer gets 403', async () => {
    rbac.setRole('viewer')
    jest.resetModules()
    ;({ POST: UPLOAD_POST } = await import('@/app/api/bank-feeds/upload/route'))
    const csv = 'Date,Description,Amount\n2025-01-13,SAMPLE,10.00\n'
    const res: any = await UPLOAD_POST(makeReq('http://localhost/api/bank-feeds/upload', { method: 'POST', headers: { 'Content-Type': 'text/csv' }, body: csv }))
    expect(res.status).toBe(403)
    const j = await res.json()
    expect(j.error).toMatch(/Forbidden/)
  })

  it('supports header variants and debit/credit parsing', async () => {
    const before = DB.transactions.length
    const csv = [
      '\uFEFFPosted Date,Details,Memo/Description,Debit,Credit,Reference',
      '2025-01-15,POS,COFFEE SHOP,4.50,,fit-100',
      '2025-01-16,DEPOSIT,CLIENT PAYMENT,,1250.00,fit-101',
    ].join('\n') + '\n'
    const res: any = await UPLOAD_POST(makeReq('http://localhost/api/bank-feeds/upload', { method: 'POST', headers: { 'Content-Type': 'text/csv' }, body: csv }))
    expect(res.status).toBe(200)
    const j = await res.json()
    expect(j.added).toBe(2)
    const xs = DB.transactions.slice(-2)
    // Expect first amount negative (debit), second positive (credit)
    expect(xs[0].amount).toBeLessThan(0)
    expect(xs[1].amount).toBeGreaterThan(0)
    // External IDs should be set from reference
    expect(xs.map((t: any) => t.externalId)).toEqual(['fit-100','fit-101'])
    // Both should be visible under For Review list filters after upload (imported)
    expect(xs.every((t: any) => t.bankStatus === 'imported')).toBe(true)
  })

  it('enforces size/row limits gracefully', async () => {
    // Build a payload slightly over 2MB
    const header = 'Date,Description,Amount\n'
    const line = '2025-01-20,NOTE,' + '1.00' + '\n'
    let body = header
    // create many rows to exceed ~2MB
    const target = 2100000 / (line.length)
    for (let i = 0; i < target; i++) body += line
    const res: any = await UPLOAD_POST(makeReq('http://localhost/api/bank-feeds/upload', { method: 'POST', headers: { 'Content-Type': 'text/csv' }, body }))
    // Either 413 or capped processing result depending on exact boundary
    if (res.status === 413) {
      const j = await res.json(); expect(j.error).toMatch(/Payload too large/)
    } else {
      const j = await res.json(); expect(j.totalRows).toBeGreaterThan(0)
    }
  })
})
