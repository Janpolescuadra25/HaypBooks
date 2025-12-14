import { GET as JDCsv } from '@/app/api/journal/[id]/export/route'

const makeReq = (url: string) => new Request(url)

describe('Journal detail CSV-Version opt-in', () => {
  it('omits CSV-Version by default', async () => {
    const res: any = await JDCsv(makeReq('http://test/api/journal/123/export') as any, { params: { id: '123' } } as any)
    expect(res.status).toBe(200)
    const text = await res.text()
    const first = text.split('\n',1)[0]
    expect(first.startsWith('CSV-Version')).toBe(false)
  })

  it('includes CSV-Version,1 when opted-in', async () => {
    const res: any = await JDCsv(makeReq('http://test/api/journal/123/export?csvVersion=1') as any, { params: { id: '123' } } as any)
    expect(res.status).toBe(200)
    const text = await res.text()
    const lines = text.split('\n')
    expect(lines[0]).toBe('CSV-Version,1')
    expect(lines[1]).toMatch(/^Journal /)
    expect(lines[2]).toBeTruthy() // caption
    // Next should be header for lines (allow either seeded or fallback header shapes)
  const hasDetailedHeader = lines.some((l: string) => l.startsWith('Date,Account #,Account Name,Debit,Credit,Memo'))
  const hasFallbackHeader = lines.some((l: string) => l.startsWith('Account,Name,Memo,Debit,Credit'))
    expect(hasDetailedHeader || hasFallbackHeader).toBe(true)
  })
})
