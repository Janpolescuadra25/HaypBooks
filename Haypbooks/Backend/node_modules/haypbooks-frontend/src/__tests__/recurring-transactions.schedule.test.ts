import { advanceNextRun, addTemplate } from '@/app/api/recurring-transactions/store'

describe('Recurring Transactions scheduling', () => {
  function make(date: string, frequency: 'monthly'|'weekly'|'daily', overrides: any = {}) {
    return addTemplate({
      kind: 'journal',
      name: `${frequency}-${date}`,
      status: 'active',
      startDate: date,
      frequency,
      lines: [{ description: 'Line', amount: 10 }],
      ...overrides,
    })
  }

  it('rolls 2025-01-31 monthly to 2025-02-28 (non-leap year)', () => {
    const t = make('2025-01-31','monthly')
    advanceNextRun(t)
    expect(t.nextRunDate).toBe('2025-02-28')
  })

  it('rolls 2024-01-31 monthly to 2024-02-29 (leap year)', () => {
    const t = make('2024-01-31','monthly')
    advanceNextRun(t)
    expect(t.nextRunDate).toBe('2024-02-29')
  })

  it('rolls 2025-03-31 monthly to 2025-04-30', () => {
    const t = make('2025-03-31','monthly')
    advanceNextRun(t)
    expect(t.nextRunDate).toBe('2025-04-30')
  })

  it('preserves mid-month day (2025-05-15 -> 2025-06-15)', () => {
    const t = make('2025-05-15','monthly')
    advanceNextRun(t)
    expect(t.nextRunDate).toBe('2025-06-15')
  })

  it('decrements remainingRuns and auto-pauses at zero', () => {
    const t = make('2025-01-10','monthly',{ remainingRuns: 2, totalRuns: 2 })
    expect(t.status).toBe('active')
    advanceNextRun(t) // remaining 1
    expect(t.remainingRuns).toBe(1)
    expect(t.status).toBe('active')
    advanceNextRun(t) // remaining 0
    expect(t.remainingRuns).toBe(0)
    expect(t.status).toBe('paused')
  })
})
