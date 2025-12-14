import { GET as AL_EXP } from '@/app/api/reports/account-ledger/export/route'
import { setRoleOverride } from '@/lib/rbac'

const makeReq = (url: string) => new Request(url)

describe('Account Ledger CSV export', () => {
  afterEach(() => setRoleOverride(undefined))

  it('includes caption, header, rows, and filename with account token', async () => {
    setRoleOverride('viewer')
    const today = new Date()
    const todayIso = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate())).toISOString().slice(0,10)
    // Use a period that includes recent dates so rows are present
    const url = 'http://localhost/api/reports/account-ledger/export?account=1000&period=Last2Weeks'
    const res: any = await AL_EXP(makeReq(url))
    expect(res.status).toBe(200)
    const cd = res.headers.get('Content-Disposition') as string
    expect(cd).toContain(`account-ledger-asof-${todayIso}_1000`)
    const text = await res.text()
    const lines = text.split(/\r?\n/)
    // caption, blank, header
    expect(lines[2]).toBe('Date,Memo,Debit,Credit,Balance')
    expect(lines.length).toBeGreaterThan(4)
  })
})
