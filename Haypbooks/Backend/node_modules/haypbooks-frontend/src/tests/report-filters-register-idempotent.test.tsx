import { renderHook, act } from '@testing-library/react'
import { useReportFilters, useReportFilterStore } from '@/stores/reportFilters'

jest.useFakeTimers()

jest.mock('@/lib/preferences', () => {
  const db: Record<string, any> = {}
  return {
    getReportFilters: async (k: string) => db[k] || { filters: {}, updatedAt: new Date().toISOString() },
    setReportFilters: async (k: string, filters: any) => { db[k] = { filters, updatedAt: new Date().toISOString() }; return db[k] }
  }
})

describe('report filters register idempotent', () => {
  it('calling register repeatedly does not duplicate key or loop', () => {
    const { result } = renderHook(() => useReportFilters('list:loopTest'))

    act(() => { result.current.register(); result.current.register(); result.current.register() })

    const state = useReportFilterStore.getState()
    const occurrences = Array.from(state.activeKeys).filter(k => k === 'list:loopTest').length
    expect(occurrences).toBe(1)

    // ensure an update + debounce still works
    act(() => { result.current.update({ a: '1' }) })
    act(() => { jest.advanceTimersByTime(600) })
    const after = useReportFilterStore.getState().entities['list:loopTest']
    expect(after.filters).toEqual({ a: '1' })
  })
})
