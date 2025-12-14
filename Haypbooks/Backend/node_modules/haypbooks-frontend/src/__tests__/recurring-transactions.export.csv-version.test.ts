import { GET as CSV_EXPORT } from '@/app/api/recurring-transactions/export/route'
import { addTemplate } from '@/app/api/recurring-transactions/store'

const makeReq = (url: string) => new Request(url)

describe('Recurring Transactions CSV-Version opt-in', () => {
  beforeAll(async () => {
    // Ensure at least one template exists for export
    addTemplate({
      kind: 'journal',
      name: 'Test Template',
      status: 'active',
      startDate: '2025-01-15',
      frequency: 'monthly',
      lines: [{ description: 'Line', amount: 42 }],
      currency: 'USD',
    })
  })

  // JSON list route returns 200 with no params; covered implicitly by export which delegates.

  it('omits CSV-Version by default; caption is first line', async () => {
  const csvRes: any = await CSV_EXPORT(makeReq('http://test/api/recurring-transactions/export'))
    expect(csvRes.status).toBe(200)
    const text = await csvRes.text()
    const first = text.split('\n', 1)[0]
    expect(first.startsWith('CSV-Version')).toBe(false)
  })

  it('includes CSV-Version,1 when opted-in and has expected header order', async () => {
    const csvRes: any = await CSV_EXPORT(makeReq('http://test/api/recurring-transactions/export?csvVersion=1'))
    expect(csvRes.status).toBe(200)
    const text = await csvRes.text()
    const lines = text.split('\n')
    expect(lines[0]).toBe('CSV-Version,1')
    // caption is next, then blank, then header
    const header = lines[3]
    expect(header).toBe('Name,Type,Frequency,Next Run,Last Run,Status,Remaining,Amount,Currency')
  })
})
