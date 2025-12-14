import { act, renderHook } from '@testing-library/react'
import { useReportFilters, useReportFilterStore } from '@/stores/reportFilters'

jest.useFakeTimers()

describe('report filters store multi-component behavior', () => {
  it('debounces saves for multiple rapid updates on same key', async () => {
    const { result: one } = renderHook(() => useReportFilters('list:transactions'))
    const { result: two } = renderHook(() => useReportFilters('list:transactions'))

    // initial load state
    await act(async () => {
      await one.current.load()
    })

    act(() => {
      one.current.update({ start: '2025-01-01' })
      one.current.update({ end: '2025-01-31' })
      two.current.update({ type: 'Income' })
    })

    // Fast forward less than debounce interval
    act(() => { jest.advanceTimersByTime(400) })
    // Should still be pending (status not forced to saving yet)
    const storeMid = useReportFilterStore.getState()
    expect(storeMid.entities['list:transactions'].status).not.toBe('saving')

    act(() => { jest.advanceTimersByTime(200) }) // pass 600ms total

    const storeFinal = useReportFilterStore.getState()
    expect(storeFinal.entities['list:transactions'].filters).toMatchObject({ start: '2025-01-01', end: '2025-01-31', type: 'Income' })
  })
})
