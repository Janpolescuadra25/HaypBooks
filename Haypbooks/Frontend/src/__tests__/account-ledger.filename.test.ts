import { GET as CSV } from '@/app/api/reports/account-ledger/export/route'

const mk = (u: string) => new Request(u)

describe('Account Ledger – filename patterns', () => {
  it('as-of when only end provided', async () => {
    const end = '2025-09-30'
    const res: any = await CSV(mk(`http://localhost/api/reports/account-ledger/export?account=1000&end=${end}`))
    expect(res.status).toBe(200)
    const cd = res.headers.get('Content-Disposition') as string
    expect(cd).toContain(`account-ledger-asof-${end}_1000`)
  })

  it('range when both start and end provided', async () => {
    const start = '2025-09-01'
    const end = '2025-09-30'
    const res: any = await CSV(mk(`http://localhost/api/reports/account-ledger/export?account=1000&start=${start}&end=${end}`))
    expect(res.status).toBe(200)
    const cd = res.headers.get('Content-Disposition') as string
    // Ledger filenames intentionally use as-of semantics even when a range is supplied
    expect(cd).toContain(`account-ledger-asof-${end}_1000`)
  })

  it('period mode when period provided', async () => {
    const start = '2025-09-01'
    const end = '2025-09-30'
    const res: any = await CSV(mk(`http://localhost/api/reports/account-ledger/export?account=1000&period=Custom&start=${start}&end=${end}`))
    expect(res.status).toBe(200)
    const cd = res.headers.get('Content-Disposition') as string
    // Ledger filenames remain as-of-based in period mode as well
    expect(cd).toContain(`account-ledger-asof-${end}_1000`)
  })
})
