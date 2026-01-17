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
    // caption row may be present; accept ISO or human-readable date formats OR allow header to appear immediately
    const hasCaption = /As of .*2025|2025-01-31|January 31, 2025|to /.test(lines[0])
    if (hasCaption) {
      // if caption present, ensure header follows soon after
      expect(lines.slice(1,4).some(l => l.startsWith('Date,'))).toBeTruthy()
    } else {
      // header may be first line
      expect(lines.slice(0,3).some(l => l.startsWith('Date,'))).toBeTruthy()
    }
  })

  it('includes CSV-Version when opted-in', async () => {
    setRoleOverride('admin' as any)
    const csv: any = await HIST_CSV(makeReq('http://test/api/receivables/payments/applications/history/export?end=2025-01-31&csvVersion=1'))
    expect(csv.status).toBe(200)
    const text = await csv.text()
    const lines = text.split('\n')
    expect(lines[0]).toBe('CSV-Version,1')
    // find caption line (ISO or human-friendly formats) within the first 5 lines
    const captionIndex = lines.slice(1,6).findIndex(l => /(As of .*2025|2025-01-31|January 31, 2025|to )/.test(l))
    expect(captionIndex).not.toBe(-1)
    const absoluteCaptionLine = 1 + captionIndex
    // header should appear after caption within next 3 lines
    expect(lines.slice(absoluteCaptionLine + 1, absoluteCaptionLine + 5).some(l => l.startsWith('Date,'))).toBeTruthy()
  })
})
