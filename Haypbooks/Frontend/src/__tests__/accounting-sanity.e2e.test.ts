/**
 * Accounting E2E sanity checks
 * - Trial Balance: totals.debit === totals.credit
 * - Balance Sheet: assets === liabilities + equity
 * - Profit & Loss: internal math (grossProfit, operatingIncome, netIncome)
 * - Ledger: debits == credits across all journal entries
 */

import '@/mock/seed'
import { assertBalanced } from '../test-utils/assertBalanced'

describe('Accounting sanity (E2E)', () => {
  test('trial balance is balanced', async () => {
    const { GET: GET_TB } = await import('@/app/api/reports/trial-balance/route')
    const res: any = await GET_TB(new Request('http://localhost/api/reports/trial-balance?end=2025-09-04'))
    expect(res.status || 200).toBe(200)
    const json = await res.json()
    expect(json?.totals?.debit).toBeDefined()
    expect(json?.totals?.credit).toBeDefined()
    expect(Number(json.totals.debit)).toBe(Number(json.totals.credit))
    expect(json.balanced).toBe(true)
  })

  test('balance sheet identity holds', async () => {
    const { GET: GET_BS } = await import('@/app/api/reports/balance-sheet/route')
    const res: any = await GET_BS(new Request('http://localhost/api/reports/balance-sheet?end=2025-09-04'))
    expect(res.status || 200).toBe(200)
    const json = await res.json()
    const a = Number(json?.totals?.assets || 0)
    const l = Number(json?.totals?.liabilities || 0)
    const e = Number(json?.totals?.equity || 0)
    expect(a).toBe(l + e)
    expect(json.balanced).toBe(true)
  })

  test('profit & loss math consistency', async () => {
    const { GET: GET_PL } = await import('@/app/api/reports/profit-loss/route')
    const res: any = await GET_PL(new Request('http://localhost/api/reports/profit-loss?period=YTD'))
    expect(res.status || 200).toBe(200)
    const j = await res.json()
    const t = j?.totals || {}
    expect(t).toBeDefined()
    expect(t.revenue).toBeDefined()
    expect(t.cogs).toBeDefined()
    expect(t.grossProfit).toBeDefined()
    expect(t.expenses).toBeDefined()
    expect(t.operatingIncome).toBeDefined()
    expect(t.otherIncome).toBeDefined()
    expect(t.netIncome).toBeDefined()
    expect(Number(t.grossProfit)).toBe(Number(t.revenue) - Number(t.cogs))
    expect(Number(t.operatingIncome)).toBe(Number(t.grossProfit) - Number(t.expenses))
    expect(Number(t.netIncome)).toBe(Number(t.operatingIncome) + Number(t.otherIncome))
  })

  test('ledger debits equal credits (journal-level)', () => {
    assertBalanced('global ledger')
  })
})
