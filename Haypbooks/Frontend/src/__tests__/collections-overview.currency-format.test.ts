import { GET as GET_EXPORT } from '@/app/api/collections/overview/export/route'

const makeReq = (url: string) => new Request(url)

function isCurrencyCell(s: string) {
  // Allow common currency symbols or grouping pattern with decimals
  return /[$€£]/.test(s) || /\d{1,3}(,\d{3})*\.\d{2}/.test(s)
}

describe('Collections Overview CSV export uses presentational currency', () => {
  test('formats Open Balance/Overdue/Net and totals as currency', async () => {
    const res: any = await GET_EXPORT(makeReq('http://localhost/api/collections/overview/export?asOf=2025-09-04'))
    expect(res.status).toBe(200)
    const lines = (await res.text()).trim().split(/\r?\n/)
    // Header is first line; data starts at 1
    if (lines.length < 3) {
      // In case of minimal seed data, ensure at least header and totals exist
      const last = lines[lines.length - 1]
      const totals = last.split(',')
      // Totals columns: 3=open balance, 4=overdue, 5=net receivable
      expect(isCurrencyCell(totals[3])).toBe(true)
      expect(isCurrencyCell(totals[4])).toBe(true)
      expect(isCurrencyCell(totals[5])).toBe(true)
      return
    }
    const data = lines[1].split(',')
    // Data columns: 3=open balance, 4=overdue, 5=net receivable
    expect(isCurrencyCell(data[3])).toBe(true)
    expect(isCurrencyCell(data[4])).toBe(true)
    expect(isCurrencyCell(data[5])).toBe(true)
    const totals = lines[lines.length - 1].split(',')
    expect(isCurrencyCell(totals[3])).toBe(true)
    expect(isCurrencyCell(totals[4])).toBe(true)
    expect(isCurrencyCell(totals[5])).toBe(true)
  })
})
