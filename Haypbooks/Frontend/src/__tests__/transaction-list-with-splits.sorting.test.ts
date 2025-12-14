import { GET as TLWS_JSON } from '@/app/api/reports/transaction-list-with-splits/route'

const mk = (u: string) => new Request(u)

describe('Transaction List with Splits - deterministic ordering', () => {
  it('sorts by date asc then txnId then splitAccount', async () => {
    // Fix end to make dataset deterministic
    const end = '2025-09-15'
    const res: any = await TLWS_JSON(mk(`http://localhost/api/reports/transaction-list-with-splits?end=${end}`))
    expect(res.status).toBe(200)
    const body = await res.json()
    const rows = body.rows
    // Ensure non-decreasing dates
    for (let i = 1; i < rows.length; i++) {
      expect(rows[i].date >= rows[i-1].date).toBe(true)
      if (rows[i].date === rows[i-1].date) {
        // tie-break by txnId, then splitAccount
        const a = rows[i-1]
        const b = rows[i]
        const cmpT = (a.txnId || '').localeCompare(b.txnId || '')
        if (cmpT === 0) {
          expect((a.splitAccount || '').localeCompare(b.splitAccount || '') <= 0).toBe(true)
        }
      }
    }
  })
})
