import { renderHook } from '@testing-library/react'
import { flushAsync, withinAct } from '../test-utils/act-helpers'
import usePersistedFilterParams from '../hooks/usePersistedFilterParams'
import { useReportFilterStore } from '../stores/reportFilters'

// Mock persistence API
jest.mock('../lib/preferences', () => {
  const db: Record<string, any> = {}
  return {
    getReportFilters: async (k: string) => db[k] || { filters: {}, updatedAt: new Date().toISOString() },
    setReportFilters: async (k: string, filters: any) => { db[k] = { filters, updatedAt: new Date().toISOString(), status: 'idle' }; return db[k] }
  }
})

// Mock next/navigation with mutable search string per test
jest.mock('next/navigation', () => {
  let search = ''
  let pathname = '/reports'
  return {
    usePathname: () => pathname,
    useSearchParams: () => new URLSearchParams(search),
    useRouter: () => ({
      replace: (href: string) => { const q = href.split('?')[1]; search = q || '' },
      push: (href: string) => { const q = href.split('?')[1]; search = q || '' },
    }),
    __setSearch: (q: string) => { search = q },
    __getSearch: () => search,
    __setPath: (p: string) => { pathname = p }
  }
})

describe('usePersistedFilterParams standard reports', () => {
  beforeEach(() => {
    useReportFilterStore.setState({ entities: {}, activeKeys: new Set<string>() })
    jest.useFakeTimers()
  })
  afterEach(() => { jest.useRealTimers() })

  it('hydrates saved select filter for retail-sales-by-channel', async () => {
    useReportFilterStore.getState().entities['standard:retail-sales-by-channel'] = { filters: { channel: 'Online' }, updatedAt: new Date().toISOString(), status: 'idle' }
  const { result } = renderHook(() => usePersistedFilterParams<{ channel: string}>({ reportKey: 'standard:retail-sales-by-channel', specs: [ { key: 'channel' } ] }))
  await flushAsync()
    expect(result.current.values.channel).toBe('Online')
  })

  it('applies numeric filter (minMargin) and clears for construction-job-profitability', async () => {
  const { result } = renderHook(() => usePersistedFilterParams<{ minMargin: string }>({ reportKey: 'standard:construction-job-profitability', specs: [ { key: 'minMargin' } ] }))
  await flushAsync()
    await withinAct(() => { result.current.setValues((v: any) => ({ ...v, minMargin: '25' })) })
    await withinAct(() => { result.current.apply() })
  await flushAsync()
    const st = useReportFilterStore.getState().entities['standard:construction-job-profitability']
    expect(st?.filters.minMargin).toBe('25')
    await withinAct(() => { result.current.clear() })
    const cleared = useReportFilterStore.getState().entities['standard:construction-job-profitability']
    expect(cleared?.filters.minMargin).toBe('')
  })
})
