import { renderHook, act } from '@testing-library/react'
import { useReportFilters, useAllFilterKeys, useResetAllFilters, useReportFilterStore } from '@/stores/reportFilters'

jest.useFakeTimers()

// Mock preferences backend
jest.mock('@/lib/preferences', () => {
  const db: Record<string, any> = {}
  return {
    getReportFilters: async (k: string) => db[k] || { filters: {}, updatedAt: new Date().toISOString() },
    setReportFilters: async (k: string, filters: any) => { db[k] = { filters, updatedAt: new Date().toISOString() }; return db[k] }
  }
})

describe('report filters registry + resetAll', () => {
  it('registers active keys and resets all', () => {
    const { result: a } = renderHook(() => useReportFilters('list:testA'))
    const { result: b } = renderHook(() => useReportFilters('list:testB'))

    act(() => { a.current.register(); b.current.register() })

    const { result: keysHook } = renderHook(() => useAllFilterKeys())
    expect(keysHook.current.sort()).toEqual(['list:testA','list:testB'].sort())

    act(() => { a.current.update({ foo: '1' }); b.current.update({ bar: '2' }) })
    act(() => { jest.advanceTimersByTime(600) })

    const { result: resetAllHook } = renderHook(() => useResetAllFilters())
    act(() => { resetAllHook.current() })

    const store = useReportFilterStore.getState()
    expect(store.entities['list:testA'].filters).toEqual({})
    expect(store.entities['list:testB'].filters).toEqual({})
  })
})
