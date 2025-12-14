import { GET } from '@/app/api/reports/statement-list/export/route'

function makeReq(url: string): Request { return new Request(url) }

describe('Statement List export CSV', () => {
  it('returns CSV with as-of caption and correct headers/filename', async () => {
    const end = '2025-01-31'
    const res: any = await GET(makeReq(`http://localhost/api/reports/statement-list/export?end=${end}`))
    const body = await res.text()
    const disp = res.headers.get('Content-Disposition') as string
    const lines = body.split(/\r?\n/)
    expect(lines[0]).toContain('As of')
    expect(lines[1]).toBe('')
    expect(lines[2]).toBe('Customer,Date,Amount Due,Status')
    expect(disp).toContain(`statement-list-asof-${end}`)
  })
})
