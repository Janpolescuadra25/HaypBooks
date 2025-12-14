import { GET as GET_EXPORT } from '@/app/api/accountant/write-offs/export/route'
import { setRoleOverride } from '@/lib/rbac'
import { seedIfNeeded, reopenPeriodWithAudit } from '@/mock/db'

function makeReq(url: string) { return new Request(url) }

describe('Write-offs export CSV-Version flag', () => {
  afterEach(() => setRoleOverride(undefined as any))

  test('default export omits CSV-Version; flag adds it', async () => {
    setRoleOverride('admin' as any)
    try { seedIfNeeded() } catch {}
    try { reopenPeriodWithAudit() } catch {}
    const base = 'http://local/api/accountant/write-offs/export?asOf=2025-10-01'
    const resNo: any = await GET_EXPORT(makeReq(base))
    expect(resNo.status).toBe(200)
    const textNo = await resNo.text(); const linesNo = textNo.split(/\r?\n/)
    expect(linesNo[0]).toBe('2025-10-01')
    expect(linesNo[0]).not.toContain('CSV-Version')

    const resYes: any = await GET_EXPORT(makeReq(base + '&csv=1'))
    expect(resYes.status).toBe(200)
    const textYes = await resYes.text(); const linesYes = textYes.split(/\r?\n/)
    expect(linesYes[0]).toBe('CSV-Version,1')
    expect(linesYes[1]).toBe('2025-10-01')
  })

  test('supports csvVersion synonym', async () => {
    setRoleOverride('admin' as any)
    const res: any = await GET_EXPORT(makeReq('http://local/api/accountant/write-offs/export?asOf=2025-10-01&csvVersion=1'))
    expect(res.status).toBe(200)
    const text = await res.text(); const lines = text.split(/\r?\n/)
    expect(lines[0]).toBe('CSV-Version,1')
  })
})
