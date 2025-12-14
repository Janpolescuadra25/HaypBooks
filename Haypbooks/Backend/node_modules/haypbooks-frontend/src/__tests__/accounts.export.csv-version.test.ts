import { GET as AccountsCsv } from '@/app/api/accounts/export/route'

const makeReq = (url: string) => new Request(url)

describe('Accounts CSV-Version opt-in', () => {
  it('omits CSV-Version by default', async () => {
    const res: any = await AccountsCsv(makeReq('http://test/api/accounts/export') as any)
    const body = await res.text()
    const first = body.split('\n', 1)[0]
    expect(first.startsWith('CSV-Version')).toBe(false)
  })

  it('includes CSV-Version,1 when opted-in', async () => {
    const res: any = await AccountsCsv(makeReq('http://test/api/accounts/export?csvVersion=1') as any)
    const body = await res.text()
  const lines: string[] = body.split('\n')
  expect(lines[0]).toBe('CSV-Version,1')
  // Verify presence of new header columns
  const header = lines.find((l: string) => l.startsWith('Number,')) || ''
    expect(header).toContain('Detail Type')
    expect(header).toContain('Parent Number')
  })
})
