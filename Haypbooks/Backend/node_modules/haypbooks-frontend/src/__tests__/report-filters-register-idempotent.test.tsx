import { renderHook, act } from '@testing-library/react'
import { withinAct } from '../test-utils/act-helpers'
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
  it('calling register repeatedly does not duplicate key or cause additional renders', async () => {
    const { result, rerender } = renderHook(() => useReportFilters('list:loopTest'))

    const initialFilters = result.current.filters
  await withinAct(() => { result.current.register(); result.current.register(); result.current.register() })

    // Rerender to ensure no state churn
    rerender()

    const state = useReportFilterStore.getState()
    const occurrences = Array.from(state.activeKeys).filter(k => k === 'list:loopTest').length
    expect(occurrences).toBe(1)
  expect(result.current.filters).toEqual(initialFilters) // unchanged contents until update

    // ensure an update + debounce still works
    act(() => { result.current.update({ a: '1' }) })
  await act(async () => { jest.advanceTimersByTime(600) })
    const after = useReportFilterStore.getState().entities['list:loopTest']
    expect(after.filters).toEqual({ a: '1' })
  })
})
