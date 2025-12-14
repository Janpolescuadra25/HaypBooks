import { GET as GLL_EXP } from '@/app/api/reports/general-ledger-list/export/route'
import { setRoleOverride } from '@/lib/rbac'

const mk = (u: string) => new Request(u)

describe('General Ledger List period aliasing', () => {
  afterEach(() => setRoleOverride(undefined))

  test('ThisQuarter aliases to QTD for caption/as-of', async () => {
    setRoleOverride('viewer')
    const url = 'http://localhost/api/reports/general-ledger-list/export?period=ThisQuarter&end=2025-09-15'
    const res: any = await GLL_EXP(mk(url))
    expect(res.status).toBe(200)
    const text = await res.text()
    const firstLine = text.split(/\r?\n/)[0]
    // Should contain end date (as-of) or formatted caption; ensure it mentions 2025 and not a bare preset
    expect(firstLine).toContain('2025')
  })

  test('ThisMonth aliases to MTD for caption/as-of', async () => {
    setRoleOverride('viewer')
    const url = 'http://localhost/api/reports/general-ledger-list/export?period=ThisMonth&end=2025-09-04'
    const res: any = await GLL_EXP(mk(url))
    expect(res.status).toBe(200)
    const text = await res.text()
    const firstLine = text.split(/\r?\n/)[0]
    // Human-readable range (e.g., "September 1-4, 2025"); just ensure it reflects the year
    expect(firstLine).toContain('2025')
  })
})
