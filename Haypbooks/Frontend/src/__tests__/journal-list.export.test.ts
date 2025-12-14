import { GET as JRNL_EXP } from '@/app/api/reports/journal/export/route'
import { setRoleOverride } from '@/lib/rbac'

const makeReq = (url: string) => new Request(url)

describe('Journal list CSV export', () => {
  afterEach(() => setRoleOverride(undefined))

  it('emits caption, header, rows, totals, and range filename for start/end', async () => {
    setRoleOverride('viewer')
    const url = 'http://localhost/api/reports/journal/export?start=2025-09-01&end=2025-09-10'
    const res: any = await JRNL_EXP(makeReq(url))
    expect(res.status).toBe(200)
    const cd = res.headers.get('Content-Disposition') as string
    expect(cd).toContain('journal-2025-09-01_to_2025-09-10')
    const text = await res.text()
    const lines = text.trim().split(/\r?\n/)
    expect(lines[2]).toBe('Journal No,Date,Memo,Debits,Credits')
    expect(lines[lines.length - 1].startsWith('Total,')).toBe(true)
  })

  it('uses as-of filename when only end provided', async () => {
    setRoleOverride('viewer')
    const url = 'http://localhost/api/reports/journal/export?end=2025-09-04'
    const res: any = await JRNL_EXP(makeReq(url))
    expect(res.status).toBe(200)
    const cd = res.headers.get('Content-Disposition') as string
    expect(cd).toContain('journal-asof-2025-09-04')
  })
})
