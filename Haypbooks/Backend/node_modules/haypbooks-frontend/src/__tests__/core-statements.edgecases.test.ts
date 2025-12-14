import { GET as BS_JSON } from '@/app/api/reports/balance-sheet/route'
import { GET as BS_CSV } from '@/app/api/reports/balance-sheet/export/route'
import { GET as CF_JSON } from '@/app/api/reports/cash-flow/route'
import { GET as CF_CSV } from '@/app/api/reports/cash-flow/export/route'

describe('Core statements — edge cases semantics', () => {
  test('Balance Sheet: Custom range keeps as-of filename (end date)', async () => {
    const start = '2025-01-01'
    const end = '2025-03-31'
    const url = `http://localhost/api/reports/balance-sheet/export?period=Custom&start=${start}&end=${end}`
    const res: any = await BS_CSV(new Request(url))
    const disp = res.headers.get('Content-Disposition') || ''
    expect(disp).toContain(`balance-sheet-Custom-asof-${end}`)
  })

  test('Balance Sheet: ThisQuarter aliases to QTD in JSON (asOf uses end; remains balanced); export token reflects chosen preset', async () => {
    const end = '2025-09-30'
    const jsonRes: any = await BS_JSON(new Request(`http://localhost/api/reports/balance-sheet?period=ThisQuarter&compare=1&end=${end}`))
    const payload = await jsonRes.json()
    expect(payload.asOf).toBe(end)
    expect(payload.balanced).toBe(true)
    const csvRes: any = await BS_CSV(new Request(`http://localhost/api/reports/balance-sheet/export?period=ThisQuarter&compare=1&end=${end}`))
    const disp = csvRes.headers.get('Content-Disposition') || ''
    // Export filename token uses the original preset label by policy
    expect(disp).toContain(`balance-sheet-ThisQuarter-compare-asof-${end}`)
  })

  test('Cash Flow: ThisQuarter derives range and returns sections with netChange sum; compare emits prev', async () => {
    const res: any = await CF_JSON(new Request('http://localhost/api/reports/cash-flow?period=ThisQuarter&compare=1'))
    const data = await res.json()
    expect(typeof data.sections.operations).toBe('number')
    expect(typeof data.sections.investing).toBe('number')
    expect(typeof data.sections.financing).toBe('number')
    expect(data.netChange).toBe(data.sections.operations + data.sections.investing + data.sections.financing)
    expect(data.prev).toBeTruthy()
  })

  test('Cash Flow: Custom range uses as-of filename (end date) in export', async () => {
    const start = '2025-01-01'
    const end = '2025-03-31'
    const res: any = await CF_CSV(new Request(`http://localhost/api/reports/cash-flow/export?period=Custom&start=${start}&end=${end}`))
    const disp = res.headers.get('Content-Disposition') || ''
    expect(disp).toContain(`cash-flow-Custom-asof-${end}`)
  })
})
