import { GET as GET_EXPORT } from '@/app/api/bills/scheduled/export/route'

const makeReq = (url: string) => new Request(url)

describe('Scheduled Bills CSV export', () => {
  test('uses caption-first, stable header, and helper filename', async () => {
    const res: any = await GET_EXPORT(makeReq('http://localhost/api/bills/scheduled/export?period=Custom&start=2025-09-01&end=2025-09-30'))
    const body = await res.text()
    const disp = res.headers.get('Content-Disposition') as string
    const lines = body.split(/\r?\n/)
    // Caption row via shared builder should show range when both start/end provided
    expect(lines[0]).toMatch(/September/)
    // Header row after spacer
    expect(lines[2]).toBe('Bill #,Vendor,Due Date,Scheduled Date,Total,Balance')
    // Filename via buildCsvFilename with range semantics
    expect(disp).toContain('scheduled-bills-2025-09-01_to_2025-09-30')
  })
})
