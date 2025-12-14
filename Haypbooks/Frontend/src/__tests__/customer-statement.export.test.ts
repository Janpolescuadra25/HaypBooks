import { GET as STMT_EXPORT } from '@/app/api/customers/[id]/statement/export/route'
import { seedIfNeeded, db } from '@/mock/db'

const makeReq = (url: string) => new Request(url)

describe('Customer Statement CSV export', () => {
  test('includes As of caption, header, rows, totals, and filename tokens', async () => {
    // Use a real seeded customer to ensure there are statement lines
    seedIfNeeded()
    const custId = db.customers[0].id
    const asOf = '2025-09-15'
    const url = `http://localhost/api/customers/${custId}/statement/export?asOf=${asOf}`
  const res: any = await STMT_EXPORT(makeReq(url), { params: { id: custId } } as any)
    expect(res.status).toBe(200)
    const body = await res.text()
    const lines = body.trim().split(/\r?\n/)
    // Caption, blank, header
    expect(lines[0]).toContain('As of')
    expect(lines[2]).toBe('Date,Type,Description,Amount,Running Balance')
    // At least 1 data line and a Totals line
    const dataLines = lines.slice(3)
    expect(dataLines.length).toBeGreaterThan(0)
  const last = dataLines[dataLines.length - 1]
  expect(last.startsWith('Totals')).toBe(true)
  // Validate Totals ending balance equals the last running balance from detail
  const lastDetail = dataLines[dataLines.length - 2]
  const lastDetailCols = lastDetail.split(',')
  const finalRunning = Number(lastDetailCols[lastDetailCols.length - 1])
  const totalsCols = last.split(',')
  const totalsEnding = Number(totalsCols[totalsCols.length - 1])
  expect(Number.isNaN(finalRunning)).toBe(false)
  expect(Number.isNaN(totalsEnding)).toBe(false)
  expect(totalsEnding).toBe(finalRunning)
    // Filename
    const cd = res.headers.get('Content-Disposition') as string
    expect(cd).toContain(`customer-statement-asof-${asOf}_cust-${custId}`)
  })
})
