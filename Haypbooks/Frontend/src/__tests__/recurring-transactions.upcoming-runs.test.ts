import { addTemplate, computeUpcomingRuns } from '@/app/api/recurring-transactions/store'

describe('recurring-transactions: computeUpcomingRuns', () => {
  it('projects next 3 monthly runs from Jan 31 with month-end clamping', () => {
    const t = addTemplate({
      kind: 'journal', name: 'Month End', status: 'active', startDate: '2025-01-31', frequency: 'monthly',
      nextRunDate: '2025-01-31', lines: [{ description: 'x', amount: 1 }]
    }) as any
    const next = computeUpcomingRuns(t, 3)
    expect(next[0]).toBe('2025-01-31')
    expect(next[1]).toBe('2025-02-28')
    expect(['2025-03-31','2025-03-28']).toContain(next[2])
  })

  it('projects yearly runs and clamps Feb 29 on non-leap years', () => {
    const t = addTemplate({
      kind: 'journal', name: 'Yearly', status: 'active', startDate: '2024-02-29', frequency: 'yearly',
      nextRunDate: '2024-02-29', lines: [{ description: 'x', amount: 1 }]
    }) as any
    const next = computeUpcomingRuns(t, 3)
    // 2025 is not leap -> Feb 28; 2026 is not leap -> Feb 28
    expect(next).toEqual(['2024-02-29','2025-02-28','2026-02-28'])
  })

  it('respects remainingRuns cap', () => {
    const t = addTemplate({
      kind: 'invoice', name: 'Limited', status: 'active', startDate: '2025-01-01', frequency: 'weekly',
      nextRunDate: '2025-01-01', remainingRuns: 2, lines: [{ description: 'x', amount: 10 }]
    }) as any
    const next = computeUpcomingRuns(t, 3)
    expect(next).toEqual(['2025-01-01','2025-01-08'])
  })
})
