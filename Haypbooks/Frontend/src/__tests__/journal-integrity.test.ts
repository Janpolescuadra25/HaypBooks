import { assertBalanced } from '../test-utils/assertBalanced'

describe('Journal integrity', () => {
  test('diagnostics ledger endpoint balances', async () => {
    const { GET } = await import('@/app/api/diagnostics/ledger/route')
    const res: any = await GET()
    const json = await res.json()
    // Use centralized helper for overall ledger balance invariant
    assertBalanced('diagnostics ledger endpoint')
    expect(json.totalDebits).toBeGreaterThan(0)
    expect(json.totalCredits).toBeGreaterThan(0)
    expect(Number(json.totalDebits.toFixed(2))).toBe(Number(json.totalCredits.toFixed(2)))
    expect(json.difference).toBe(0)
    // Trial balance net of all accounts should equal 0 in double-entry
    const aggregateNet = json.trial.reduce((s: number, r: any) => s + (r.net || 0), 0)
    expect(Number(aggregateNet.toFixed(2))).toBe(0)
  })
})
