import { GET as SPD_EXP } from '@/app/api/reports/sales-by-product-detail/export/route'
import { GET as SPS_EXP } from '@/app/api/reports/sales-by-product-summary/export/route'
import { GET as PBPD_EXP } from '@/app/api/reports/purchases-by-product-detail/export/route'
import { GET as PBPS_EXP } from '@/app/api/reports/purchases-by-product-summary/export/route'

const makeReq = (url: string) => new Request(url)

// Smoke tests to ensure Amount/Rate columns and totals are formatted as presentational currency
// We don't assert exact values, just that they contain a currency symbol or grouping consistent with formatting.

function isCurrencyCell(s: string) {
  // Allow $, €, £, or a generic pattern with commas/decimals; keep it loose to avoid locale brittleness
  return /[$€£]/.test(s) || /\d{1,3}(,\d{3})*\.\d{2}/.test(s)
}

describe('Product-based exports use presentational currency', () => {
  it('sales-by-product-detail formats Rate and Amount and totals', async () => {
    const res: any = await SPD_EXP(makeReq('http://localhost/api/reports/sales-by-product-detail/export?end=2025-09-04'))
    expect(res.status).toBe(200)
    const lines = (await res.text()).trim().split(/\r?\n/)
    // header at index 2, data starts at 3, totals is last
    const data = lines[3].split(',')
    const totals = lines[lines.length - 1].split(',')
    expect(isCurrencyCell(data[6])).toBe(true) // Rate
    expect(isCurrencyCell(data[7])).toBe(true) // Amount
    expect(isCurrencyCell(totals[7])).toBe(true) // Totals Amount
  })

  it('sales-by-product-summary formats Amount and totals', async () => {
    const res: any = await SPS_EXP(makeReq('http://localhost/api/reports/sales-by-product-summary/export?end=2025-09-04'))
    expect(res.status).toBe(200)
    const lines = (await res.text()).trim().split(/\r?\n/)
    const data = lines[3].split(',')
    const totals = lines[lines.length - 1].split(',')
    expect(isCurrencyCell(data[3])).toBe(true)
    expect(isCurrencyCell(totals[3])).toBe(true)
  })

  it('purchases-by-product-detail formats Rate and Amount and totals', async () => {
    const res: any = await PBPD_EXP(makeReq('http://localhost/api/reports/purchases-by-product-detail/export?end=2025-09-04'))
    expect(res.status).toBe(200)
    const lines = (await res.text()).trim().split(/\r?\n/)
    const data = lines[3].split(',')
    const totals = lines[lines.length - 1].split(',')
    expect(isCurrencyCell(data[6])).toBe(true)
    expect(isCurrencyCell(data[7])).toBe(true)
    expect(isCurrencyCell(totals[7])).toBe(true)
  })

  it('purchases-by-product-summary formats Amount and totals', async () => {
    const res: any = await PBPS_EXP(makeReq('http://localhost/api/reports/purchases-by-product-summary/export?end=2025-09-04'))
    expect(res.status).toBe(200)
    const lines = (await res.text()).trim().split(/\r?\n/)
    const data = lines[3].split(',')
    const totals = lines[lines.length - 1].split(',')
    expect(isCurrencyCell(data[3])).toBe(true)
    expect(isCurrencyCell(totals[3])).toBe(true)
  })
})
