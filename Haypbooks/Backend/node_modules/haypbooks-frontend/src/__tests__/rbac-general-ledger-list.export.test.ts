import { GET as GLL_EXP } from '@/app/api/reports/general-ledger-list/export/route'
import { setRoleOverride } from '@/lib/rbac'

const makeReq = (url: string) => new Request(url)

describe('RBAC: General Ledger List CSV export', () => {
  afterEach(() => setRoleOverride(undefined))

  test('denies when lacking reports:read', async () => {
    setRoleOverride('no-reports' as any)
    const res: any = await GLL_EXP(makeReq('http://localhost/api/reports/general-ledger-list/export'))
    expect(res.status).toBe(403)
  })

  test('allows viewer and includes correct filename and shape', async () => {
    setRoleOverride('viewer')
    const res: any = await GLL_EXP(makeReq('http://localhost/api/reports/general-ledger-list/export?end=2025-09-04'))
    expect(res.status).toBe(200)
    const cd = res.headers.get('Content-Disposition') as string
    expect(cd).toContain('general-ledger-list-asof-2025-09-04')
    expect((res.headers.get('Content-Type') || '')).toContain('text/csv')
    const text = await res.text()
    const lines = text.trim().split(/\r?\n/)
    expect(lines[2]).toBe('Account,Beginning,Debits,Credits,Net Change,Ending')
    expect(lines[lines.length - 1].startsWith('Total,')).toBe(true)
  })
})
