import { GET as BILLS_GET } from '@/app/api/bills/export/route'

function makeReq(url: string): Request { return new Request(url) }

function parseCsv(csv: string): string[][] {
  return csv.split('\n').map((line) => line.split(','))
}

describe('Bills CSV export - status filters', () => {
  test('filters by status=paid', async () => {
    const url = 'http://localhost/api/bills/export?status=paid&end=2025-09-05'
    const res = await BILLS_GET(makeReq(url))
    const body = await (res as any).text()
    const rows = parseCsv(body)
    // rows[0] = As of header, rows[1] = CSV header
    const dataRows = rows.slice(2).filter(r => r.length >= 5)
    // Status is the 4th column (index 3): ['Bill #','Vendor','Due','Status','Total']
    expect(dataRows.length).toBeGreaterThan(0)
    for (const r of dataRows) {
      expect(r[3]).toBe('paid')
    }
  })

  test('status=overdue excludes paid items', async () => {
    // Overdue is dueDate < today and not paid
    const url = 'http://localhost/api/bills/export?status=overdue'
    const res = await BILLS_GET(makeReq(url))
    const body = await (res as any).text()
    const rows = parseCsv(body)
    const dataRows = rows.slice(2).filter(r => r.length >= 5)
    // It is possible there are 0 overdue based on date, but when present none should be paid
    for (const r of dataRows) {
      expect(r[3]).not.toBe('paid')
    }
  })
})
