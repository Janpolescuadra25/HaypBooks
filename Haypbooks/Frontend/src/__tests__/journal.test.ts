import { mockApi } from '@/lib/mock-api'

describe('Journal create and list', () => {
  test('POST /api/journal creates a balanced journal with validation', async () => {
    const payload = {
      date: '2025-09-04',
      memo: 'Accrual adj',
      lines: [
        { account: '1000 · Cash', debit: 100 },
        { account: '4000 · Sales Revenue', credit: 100 },
      ],
      reversing: { enabled: true, date: '2025-10-01' },
      recurring: { enabled: true, frequency: 'monthly', count: 3 },
      attachments: [{ name: 'note.txt', size: 10 }],
    }
    const res = await mockApi<any>('/api/journal', { method: 'POST', body: JSON.stringify(payload) })
    expect(res.journal).toBeTruthy()
    expect(res.journal.number).toMatch(/^JE-/)
    expect(res.journal.totals.debit).toBe(100)
    expect(res.journal.totals.credit).toBe(100)
    expect(res.journal.reversing?.enabled).toBeTruthy()
    expect(res.journal.recurring?.enabled).toBeTruthy()
  })

  test('GET /api/journal returns list', async () => {
    const res = await mockApi<any>('/api/journal', { method: 'GET' })
    expect(Array.isArray(res.journals)).toBe(true)
    expect(res.total).toBeGreaterThan(0)
  })

  test('POST /api/journal rejects line with both debit and credit non-zero', async () => {
    const payload = {
      date: '2025-09-04',
      lines: [
        { account: '1000 · Cash', debit: 100, credit: 10 },
        { account: '4000 · Sales Revenue', credit: 100 },
      ],
    }
    let msg = ''
    try {
      await mockApi<any>('/api/journal', { method: 'POST', body: JSON.stringify(payload) })
    } catch (e: any) {
      msg = String(e?.message || e)
    }
    expect(msg).toMatch(/only one of debit or credit/i)
  })

  test('POST /api/journal rejects when debits do not equal credits', async () => {
    const payload = {
      date: '2025-09-04',
      lines: [
        { account: '1000 · Cash', debit: 120 },
        { account: '4000 · Sales Revenue', credit: 100 },
      ],
    }
    let msg = ''
    try {
      await mockApi<any>('/api/journal', { method: 'POST', body: JSON.stringify(payload) })
    } catch (e: any) {
      msg = String(e?.message || e)
    }
    expect(msg).toMatch(/debits must equal credits/i)
  })
})
