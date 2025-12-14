import { GET as HIST_JSON } from '@/app/api/receivables/payments/applications/history/route'
import { GET as HIST_CSV } from '@/app/api/receivables/payments/applications/history/export/route'
import { setRoleOverride } from '@/lib/rbac'
import { db, seedIfNeeded, reopenPeriodWithAudit } from '@/mock/db'

const makeReq = (url: string) => new Request(url)

describe('Payment Application History CSV export', () => {
  beforeAll(() => { try { seedIfNeeded() } catch {}; try { reopenPeriodWithAudit() } catch {} })
  afterEach(() => setRoleOverride(undefined as any))

  it('enforces RBAC (requires audit:read and reports:read)', async () => {
    setRoleOverride('viewer' as any) // lacks audit:read
    const res: any = await HIST_CSV(makeReq('http://test/api/receivables/payments/applications/history/export'))
    expect(res.status).toBe(403)
  })

  it('omits CSV-Version by default; caption first; header shape stable', async () => {
    setRoleOverride('admin' as any)
    const json: any = await HIST_JSON(makeReq('http://test/api/receivables/payments/applications/history'))
    expect(json.status).toBe(200)
    const csv: any = await HIST_CSV(makeReq('http://test/api/receivables/payments/applications/history/export?end=2025-01-31'))
    expect(csv.status).toBe(200)
    const text = await csv.text()
    const lines = text.split('\n')
    expect(lines[0].startsWith('CSV-Version')).toBe(false)
    // caption row
    expect(lines[0]).toMatch(/As of 2025-01-31|2025-01-31|to /)
    // spacer
    expect(lines[1]).toBe('')
    // header
    expect(lines[2]).toBe('Date,Customer,Invoice,Payment Id,Applied Amount,Remaining Balance,Method,Batch Id')
  })

  it('includes CSV-Version when opted-in', async () => {
    setRoleOverride('admin' as any)
    const csv: any = await HIST_CSV(makeReq('http://test/api/receivables/payments/applications/history/export?end=2025-01-31&csvVersion=1'))
    expect(csv.status).toBe(200)
    const text = await csv.text()
    const lines = text.split('\n')
    expect(lines[0]).toBe('CSV-Version,1')
    expect(lines[1]).toMatch(/As of 2025-01-31|2025-01-31|to /)
    expect(lines[2]).toBe('')
    expect(lines[3]).toBe('Date,Customer,Invoice,Payment Id,Applied Amount,Remaining Balance,Method,Batch Id')
  })
})
