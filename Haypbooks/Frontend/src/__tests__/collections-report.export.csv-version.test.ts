import { GET as GET_EXPORT } from '@/app/api/reports/collections-report/export/route'

const makeReq = (url: string) => new Request(url)

describe('Collections Report CSV export — CSV-Version opt-in', () => {
  test('omits CSV-Version line by default', async () => {
    const res: any = await GET_EXPORT(makeReq('http://localhost/api/reports/collections-report/export?end=2025-09-04'))
    const body = await res.text()
    const lines = body.split(/\r?\n/)
    expect(lines[0]).toBe('2025-09-04')
    expect(lines[1]).toBe('')
    expect(lines[2]).toBe('Customer,Invoice Number,Due Date,Days Overdue,Open Balance,Contact,Phone')
  })

  test('includes CSV-Version line when opted in via csvVersion=1', async () => {
    const res: any = await GET_EXPORT(makeReq('http://localhost/api/reports/collections-report/export?end=2025-09-04&csvVersion=1'))
    const body = await res.text()
    const lines = body.split(/\r?\n/)
    expect(lines[0]).toBe('CSV-Version,1')
    expect(lines[1]).toBe('2025-09-04')
    expect(lines[2]).toBe('')
    expect(lines[3]).toBe('Customer,Invoice Number,Due Date,Days Overdue,Open Balance,Contact,Phone')
  })
})
