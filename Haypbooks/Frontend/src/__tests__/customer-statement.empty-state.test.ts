import { GET as STMT_EXPORT } from '@/app/api/customers/[id]/statement/export/route'
import { seedIfNeeded, db } from '@/mock/db'

const makeReq = (url: string) => new Request(url)

describe('Customer Statement CSV export — empty state', () => {
  test('renders caption, header, and Totals 0 when no lines exist', async () => {
    seedIfNeeded()
    // Create or pick a customer with no historical activity before asOf
    const custId = `cust_empty_${Date.now()}`
    db.customers.push({ id: custId, name: 'Empty Customer' } as any)
    const asOf = '1900-01-01'
    const url = `http://localhost/api/customers/${custId}/statement/export?asOf=${asOf}`
    const res: any = await STMT_EXPORT(makeReq(url), { params: { id: custId } } as any)
    expect(res.status).toBe(200)
    const body = await res.text()
    const lines = body.trim().split(/\r?\n/)
    expect(lines[0]).toContain('As of')
    expect(lines[2]).toBe('Date,Type,Description,Amount,Running Balance')
    const dataLines = lines.slice(3)
    // Expect only the Totals row (no data rows)
    expect(dataLines.length).toBe(1)
    expect(dataLines[0].startsWith('Totals')).toBe(true)
    const parts = dataLines[0].split(',')
    expect(Number(parts[parts.length - 1])).toBe(0)
  })
})
