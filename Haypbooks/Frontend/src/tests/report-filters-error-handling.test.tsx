import { act, renderHook } from '@testing-library/react'
import { useReportFilters, useReportFilterStore } from '@/stores/reportFilters'

// Mock preferences to fail first, succeed later
let fail = true
jest.mock('@/lib/preferences', () => ({
  getReportFilters: async () => ({ filters: {}, updatedAt: new Date().toISOString() }),
  setReportFilters: async (_key: string, filters: any) => {
    if (fail) {
      throw new Error('network fail')
    }
    return { filters, updatedAt: new Date().toISOString() }
  }
}))

jest.useFakeTimers()

describe('report filters error handling', () => {
  it('transitions to error then recovers on next save', async () => {
    const { result } = renderHook(() => useReportFilters('list:transactions'))
    await act(async () => { await result.current.load() })

    act(() => {
      result.current.update({ start: '2025-03-01' })
    })
    act(() => { jest.advanceTimersByTime(600) })

    let entry = useReportFilterStore.getState().entities['list:transactions']
    expect(entry.status).toBe('error')
    expect(entry.error).toMatch(/network fail/i)

    // Flip to success and update again
    fail = false
    act(() => {
      result.current.update({ end: '2025-03-31' })
    })
    act(() => { jest.advanceTimersByTime(600) })

    entry = useReportFilterStore.getState().entities['list:transactions']
    expect(entry.status).toBe('idle')
    expect(entry.filters).toMatchObject({ start: '2025-03-01', end: '2025-03-31' })
  })
})
