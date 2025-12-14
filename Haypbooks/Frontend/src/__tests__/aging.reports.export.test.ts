import { GET as GET_AR_JSON } from '@/app/api/reports/ar-aging/route'
import { GET as GET_AR_CSV } from '@/app/api/reports/ar-aging/export/route'
import { GET as GET_AP_JSON } from '@/app/api/reports/ap-aging/route'
import { GET as GET_AP_CSV } from '@/app/api/reports/ap-aging/export/route'
import { seedIfNeeded } from '@/mock/db'
import { setRoleOverride } from '@/lib/rbac'

function makeReq(url: string) { return new Request(url) }

describe('Aging Reports CSV exports', () => {
  beforeAll(() => { try { seedIfNeeded() } catch {} })
  afterEach(() => setRoleOverride(undefined as any))

  test('AR Aging export RBAC + caption + headers + totals + version opt-in', async () => {
    const asOf = '2025-10-01'
    // RBAC forbidden
    setRoleOverride('no-reports' as any)
    let res: any = await GET_AR_CSV(makeReq(`http://local/api/reports/ar-aging/export?end=${asOf}`))
    expect(res.status).toBe(403)
    // Allowed
    setRoleOverride('viewer' as any)
    res = await GET_AR_CSV(makeReq(`http://local/api/reports/ar-aging/export?end=${asOf}`))
    expect(res.status).toBe(200)
    const txt = await res.text()
    const lines = txt.split(/\r?\n/)
    // Expect caption then blank then header (non-period case adds spacer)
    expect(lines[0].startsWith('As of,')).toBe(true)
    // header on line 2 because line1 caption, line2 blank, line3 header -> index 2
  const headerIdx = lines.findIndex((l: string) => l.startsWith('Customer,'))
    expect(headerIdx).toBeGreaterThan(0)
    expect(lines[headerIdx]).toMatch(/^Customer,Current,(1-30|30),(31-60|60),(61-90|90),(>90|120\+),Total$/)
  const totals = lines.find((l: string) => l.startsWith('Totals,')) || ''
  // Split respecting potential quoted commas (none expected in first 7 cells)
  const totalsCols = totals.split(/,(?=(?:[^"]*"[^"]*")*[^"]*$)/)
  expect(totalsCols.length).toBeGreaterThanOrEqual(7)
    // Version opt-in
    const resVer: any = await GET_AR_CSV(makeReq(`http://local/api/reports/ar-aging/export?end=${asOf}&csvVersion=1`))
    expect(resVer.status).toBe(200)
    const txtVer = await resVer.text()
    expect(txtVer.split(/\r?\n/)[0]).toBe('CSV-Version,1')
    const disp = res.headers.get('Content-Disposition') || ''
    expect(disp).toContain('ar-aging')
  })

  test('AP Aging export RBAC + caption + headers + totals + version opt-in', async () => {
    const asOf = '2025-10-01'
    // RBAC forbidden
    setRoleOverride('no-reports' as any)
    let res: any = await GET_AP_CSV(makeReq(`http://local/api/reports/ap-aging/export?asOf=${asOf}`))
    expect(res.status).toBe(403)
    // Allowed
    setRoleOverride('viewer' as any)
    res = await GET_AP_CSV(makeReq(`http://local/api/reports/ap-aging/export?asOf=${asOf}`))
    expect(res.status).toBe(200)
    const txt = await res.text()
    const lines = txt.split(/\r?\n/)
    expect(lines[0].startsWith('As of,')).toBe(true)
  const headerIdx = lines.findIndex((l: string) => l.startsWith('Vendor,'))
    expect(headerIdx).toBeGreaterThan(0)
    expect(lines[headerIdx]).toMatch(/^Vendor,Current,30,60,90,120\+,Total$/)
  const totals = lines.find((l: string) => l.startsWith('Totals,')) || ''
  const totalsCols = totals.split(/,(?=(?:[^"]*"[^"]*")*[^"]*$)/)
  expect(totalsCols.length).toBeGreaterThanOrEqual(7)
    // Version opt-in
    const resVer: any = await GET_AP_CSV(makeReq(`http://local/api/reports/ap-aging/export?asOf=${asOf}&csvVersion=1`))
    expect(resVer.status).toBe(200)
    const txtVer = await resVer.text()
    expect(txtVer.split(/\r?\n/)[0]).toBe('CSV-Version,1')
    const disp = res.headers.get('Content-Disposition') || ''
    expect(disp).toContain('ap-aging')
  })
})
