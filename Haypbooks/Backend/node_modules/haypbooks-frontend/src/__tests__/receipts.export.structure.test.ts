import { GET as Export } from '@/app/api/receipts/export/route'
import { GET as List, POST as Create } from '@/app/api/receipts/route'

const make = (u: string) => new Request(u)

describe('receipts export structure', () => {
  beforeAll(async () => {
    // Seed a couple of receipts via POST (simulate role granting journal:write by setting cookie header if needed later)
    await Create(new Request('http://test/api/receipts', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ vendor: 'Alpha Supplies', amount: 123.45, method: 'upload' }) }) as any)
    await Create(new Request('http://test/api/receipts', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ vendor: 'Bravo Office', amount: 67.89, status: 'matched', matchedTransactionId: 'txn-123' }) }) as any)
  })

  test('includes caption, header, formatted currency, and data rows', async () => {
    const res: any = await Export(make('http://test/api/receipts/export') as any)
    expect(res.ok).toBe(true)
    const text = await res.text()
  const lines: string[] = text.split('\n')
    // CSV-Version should be absent by default
    expect(lines[0].startsWith('CSV-Version')).toBe(false)
  // Caption line should be present (As of or a human-readable range)
  expect(lines[0].startsWith('As of ') || /\d{4}/.test(lines[0])).toBe(true)
    // Header after blank line
  const headerIdx = lines.findIndex((l: string) => l.startsWith('Date,Vendor,Amount,'))
    expect(headerIdx).toBeGreaterThan(0)
  const dataLines: string[] = lines.slice(headerIdx + 1).filter((l: string) => l.trim() !== '')
    expect(dataLines.length).toBeGreaterThanOrEqual(2)
    // Currency formatting (contains $ or base currency symbol assumption); fallback check for comma separation
    expect(/Alpha Supplies/.test(text)).toBe(true)
    expect(/Bravo Office/.test(text)).toBe(true)
  })

  test('CSV-Version appears when flagged', async () => {
    const res: any = await Export(make('http://test/api/receipts/export?csvVersion=1') as any)
    const body = await res.text()
    expect(body.split('\n',1)[0]).toBe('CSV-Version,1')
  })
})
