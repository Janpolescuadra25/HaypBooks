import { GET as BS_GET } from '@/app/api/reports/balance-sheet/export/route'
import { GET as TB_GET } from '@/app/api/reports/trial-balance/export/route'
import { GET as EXP_GET } from '@/app/api/expenses/export/route'
import { GET as SR_GET } from '@/app/api/sales-receipts/export/route'

function makeReq(url: string): Request {
  return new Request(url)
}

describe('CSV export routes', () => {
  test('Balance Sheet export includes As of and correct filename', async () => {
    const url = 'http://localhost/api/reports/balance-sheet/export?period=YTD&end=2025-09-04'
    const res = await BS_GET(makeReq(url))
    const body = await (res as any).text()
    const headers = (res as any).headers
    const cd = headers.get('Content-Disposition') as string
    expect(body.split('\n')[0]).toContain('As of')
    expect(cd).toContain('balance-sheet-YTD-asof-2025-09-04')
  })

  test('Trial Balance export includes As of and filename format', async () => {
    const url = 'http://localhost/api/reports/trial-balance/export?end=2025-09-04'
    const mockData = {
      rows: [
        { number: '1000', name: 'Cash', debit: 1000, credit: 0 },
        { number: '2000', name: 'AP', debit: 0, credit: 1000 },
      ],
      totals: { debit: 1000, credit: 1000 },
    }
    const fetchSpy = jest.spyOn(global as any, 'fetch').mockResolvedValue(
      new Response(JSON.stringify(mockData), { status: 200, headers: { 'Content-Type': 'application/json' } })
    )
    const res = await TB_GET(makeReq(url))
    const body = await (res as any).text()
    const headers = (res as any).headers
    const cd = headers.get('Content-Disposition') as string
    expect(body.split('\n')[0]).toContain('As of')
    expect(cd).toContain('trial-balance-asof-2025-09-04')
    fetchSpy.mockRestore()
  })

  test('Expenses export includes As of and filename format', async () => {
    // Cookie fallback role is admin per rbac.ts; ensure reports:read available
    const url = 'http://localhost/api/expenses/export?end=2025-09-04'
    const res = await EXP_GET(makeReq(url))
    const body = await (res as any).text()
    const headers = (res as any).headers
    const cd = headers.get('Content-Disposition') as string
    expect(body.split('\n')[0]).toContain('As of')
    expect(cd).toContain('expenses-asof-2025-09-04')
  })

  test('Sales Receipts export includes As of and filename format', async () => {
    const url = 'http://localhost/api/sales-receipts/export?end=2025-09-04'
    const res = await SR_GET(makeReq(url))
    const body = await (res as any).text()
    const headers = (res as any).headers
    const cd = headers.get('Content-Disposition') as string
    expect(body.split('\n')[0]).toContain('As of')
    expect(cd).toContain('sales-receipts-asof-2025-09-04')
  })
})
