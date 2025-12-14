import { renderHook, act } from '@testing-library/react'
import { flushAsync, withinAct } from '../test-utils/act-helpers'
import usePersistedFilterParams from '../hooks/usePersistedFilterParams'
import { useReportFilterStore } from '@/stores/reportFilters'

// Fake preferences backend
jest.mock('@/lib/preferences', () => {
  const db: Record<string, any> = {}
  return {
    getReportFilters: async (k: string) => db[k] || { filters: {}, updatedAt: new Date().toISOString() },
    setReportFilters: async (k: string, filters: any) => { db[k] = { filters, updatedAt: new Date().toISOString() }; return db[k] }
  }
})

// Mock next/navigation pieces in a minimal way
jest.mock('next/navigation', () => {
  const actual = jest.requireActual('next/navigation')
  let search = ''
  return {
    ...actual,
    usePathname: () => '/r',
    useSearchParams: () => new URLSearchParams(search),
    useRouter: () => ({
      replace: (href: string) => { const q = href.split('?')[1]; search = q || '' },
      push: (href: string) => { const q = href.split('?')[1]; search = q || '' },
    }),
  }
})

beforeEach(() => { jest.useFakeTimers() })
afterEach(() => { jest.useRealTimers() })

describe('usePersistedFilterParams', () => {
  it('hydrates from store when URL empty and applies to URL', async () => {
    // Prime store with a persisted filter value
    act(() => {
      useReportFilterStore.getState().entities['list:test'] = { filters: { foo: 'bar' }, updatedAt: new Date().toISOString(), status: 'idle' }
    })

    const { result } = renderHook(() => usePersistedFilterParams<{ foo: string }>({ reportKey: 'list:test', specs: [{ key: 'foo' }] }))

    // run effect & allow any debounce/microtasks to settle
    jest.runOnlyPendingTimers()
    await flushAsync()
    expect(result.current.values.foo).toBe('bar')
  })

  it('apply writes to store and would update URL', async () => {
    const { result } = renderHook(() => usePersistedFilterParams<{ foo: string; bar: string }>({ reportKey: 'list:test2', specs: [{ key: 'foo' }, { key: 'bar' }] }))
  await withinAct(() => { result.current.setValues((v: any) => ({ ...v, foo: 'x', bar: 'y' })) })
  await withinAct(() => { result.current.apply() })
    const st = useReportFilterStore.getState().entities['list:test2']
    expect(st.filters.foo).toBe('x')
    expect(st.filters.bar).toBe('y')
  })

  it('clear wipes store filters', async () => {
    const { result } = renderHook(() => usePersistedFilterParams<{ foo: string }>({ reportKey: 'list:test3', specs: [{ key: 'foo' }] }))
  await withinAct(() => { result.current.setValues((v: any) => ({ ...v, foo: 'abc' })) })
  await withinAct(() => { result.current.apply() })
  await withinAct(() => { result.current.clear() })
    const st = useReportFilterStore.getState().entities['list:test3']
    expect(st.filters.foo).toBe('')
  })
})
