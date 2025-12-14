import { GET as GET_EXPORT } from '@/app/api/accountant/finance-charges/export/route'
import { setRoleOverride } from '@/lib/rbac'
import { seedIfNeeded, reopenPeriodWithAudit } from '@/mock/db'

function makeReq(url: string) { return new Request(url) }

describe('Finance charges export CSV-Version flag', () => {
  afterEach(() => setRoleOverride(undefined as any))

  test('omits CSV-Version row by default and includes when flag present (csv=1)', async () => {
    setRoleOverride('admin' as any)
    try { seedIfNeeded() } catch {}
    try { reopenPeriodWithAudit() } catch {}
    const baseUrl = 'http://local/api/accountant/finance-charges/export?asOf=2025-10-01'
    const resNo: any = await GET_EXPORT(makeReq(baseUrl))
    expect(resNo.status).toBe(200)
    const textNo = await resNo.text()
    const linesNo = textNo.split(/\r?\n/)
    expect(linesNo[0]).toMatch(/^2025-10-01$/) // caption (no CSV-Version row)
    expect(linesNo[0]).not.toContain('CSV-Version')

    const resYes: any = await GET_EXPORT(makeReq(baseUrl + '&csv=1'))
    expect(resYes.status).toBe(200)
    const textYes = await resYes.text()
    const linesYes = textYes.split(/\r?\n/)
    expect(linesYes[0]).toBe('CSV-Version,1')
    expect(linesYes[1]).toMatch(/^2025-10-01$/)
  })

  test('accepts alternative flag spellings (csvVersion=1)', async () => {
    setRoleOverride('admin' as any)
    const res: any = await GET_EXPORT(makeReq('http://local/api/accountant/finance-charges/export?asOf=2025-10-01&csvVersion=1'))
    expect(res.status).toBe(200)
    const text = await res.text()
    const lines = text.split(/\r?\n/)
    expect(lines[0]).toBe('CSV-Version,1')
  })
})
