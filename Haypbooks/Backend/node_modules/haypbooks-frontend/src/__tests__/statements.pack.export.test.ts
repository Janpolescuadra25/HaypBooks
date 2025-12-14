import { GET as PACK_JSON } from '@/app/api/customers/statements/pack/route'
import { GET as PACK_EXPORT } from '@/app/api/customers/statements/pack/export/route'
import { setRoleOverride } from '@/lib/rbac'
import { seedIfNeeded, db } from '@/mock/db'

function makeReq(url: string) { return new Request(url) }

describe('Customer Statements Pack JSON & CSV export', () => {
  beforeAll(() => { try { seedIfNeeded() } catch {} })
  afterEach(() => setRoleOverride(undefined as any))

  test('RBAC 403 when missing reports:read', async () => {
    setRoleOverride('no-reports' as any)
    const res: any = await PACK_JSON(makeReq('http://local/api/customers/statements/pack?asOf=2025-10-01'))
    expect(res.status).toBe(403)
    const exp: any = await PACK_EXPORT(makeReq('http://local/api/customers/statements/pack/export?asOf=2025-10-01'))
    expect(exp.status).toBe(403)
  })

  test('JSON aggregator returns statements list for provided customers', async () => {
    setRoleOverride('viewer' as any)
    const c1 = db.customers[0].id
    const c2 = db.customers[1].id
    const res: any = await PACK_JSON(makeReq(`http://local/api/customers/statements/pack?asOf=2025-10-01&customerId=${c1},${c2}`))
    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json.count).toBe(2)
    expect(json.statements.length).toBe(2)
    expect(json.statements[0]).toHaveProperty('statement')
  })

  test('CSV export emits caption, header, per-customer totals and optional CSV-Version', async () => {
    setRoleOverride('viewer' as any)
    const resNo: any = await PACK_EXPORT(makeReq('http://local/api/customers/statements/pack/export?asOf=2025-10-01'))
    expect(resNo.status).toBe(200)
    const textNo = await resNo.text()
    const linesNo = textNo.split(/\r?\n/)
  // Caption may be bare ISO (2025-10-01) or human readable (As of October 1, 2025) possibly quoted if it contains a comma
  const capNo = linesNo[0].replace(/^"|"$/g,'')
  expect(capNo).toMatch(/^(2025-10-01|As of .*2025)$/)
    // Find header line
  const headerIdx = linesNo.findIndex((l: string) => l.startsWith('Customer,Date,Type,Description,Amount,Running Balance'))
    expect(headerIdx).toBeGreaterThan(-1)

    const resYes: any = await PACK_EXPORT(makeReq('http://local/api/customers/statements/pack/export?asOf=2025-10-01&csv=1'))
    expect(resYes.status).toBe(200)
    const textYes = await resYes.text()
    const linesYes = textYes.split(/\r?\n/)
    expect(linesYes[0]).toBe('CSV-Version,1')
    // Caption should now be second line
  const capYes = linesYes[1].replace(/^"|"$/g,'')
  expect(capYes).toMatch(/(2025-10-01|October .* 2025)/)
    const disp = resYes.headers.get('Content-Disposition') || ''
    expect(disp).toContain('statements-pack-asof-2025-10-01')
  })
})
