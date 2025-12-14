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

// Mock next/navigation similar to bills test; maintain internal mutable search string
jest.mock('next/navigation', () => {
  let search = ''
  return {
    usePathname: () => '/expenses',
    useSearchParams: () => new URLSearchParams(search),
    useRouter: () => ({
      replace: (href: string) => { const q = href.split('?')[1]; search = q || '' },
      push: (href: string) => { const q = href.split('?')[1]; search = q || '' },
    }),
    // helper for tests if needed
    __setSearch: (q: string) => { search = q },
    __getSearch: () => search,
  }
})

describe('usePersistedFilterParams expenses migration', () => {
  beforeEach(() => {
    useReportFilterStore.setState({ entities: {}, activeKeys: new Set<string>() })
    jest.useFakeTimers()
  })
  afterEach(() => { jest.useRealTimers() })

  it('hydrates legacy mm/dd/yyyy to ISO and applies', async () => {
  // seed legacy format in mocked persistence (simulate previously saved mm/dd/yyyy values)
  useReportFilterStore.getState().entities['list:expenses'] = { filters: { start: '03/01/2025', end: '03/31/2025', category: 'Travel' }, updatedAt: new Date().toISOString(), status: 'idle' }
  const { result } = renderHook(() => usePersistedFilterParams<{ start:string; end:string; category:string }>({ reportKey: 'list:expenses', specs: [
      { key: 'start', normalize: (v: string) => v && v.includes('/') ? (() => { const [m,d,y] = v.split('/'); return `${y}-${m}-${d}` })() : (v||'') },
      { key: 'end', normalize: (v: string) => v && v.includes('/') ? (() => { const [m,d,y] = v.split('/'); return `${y}-${m}-${d}` })() : (v||'') },
      { key: 'category' }
    ] }))
    // wait a tick
  await flushAsync()
    expect(result.current.values.start).toBe('2025-03-01')
    expect(result.current.values.end).toBe('2025-03-31')
    expect(result.current.values.category).toBe('Travel')
  })

  it('apply persists and clear wipes values', async () => {
  const { result } = renderHook(() => usePersistedFilterParams<{ start:string; end:string; category:string }>({ reportKey: 'list:expenses', specs: [
      { key: 'start' }, { key: 'end' }, { key: 'category' }
    ] }))
  await flushAsync()
  await withinAct(() => { result.current.setValues((v: any) => ({ ...v, start: '2025-01-01', end: '2025-01-31', category: 'Meals' })) })
  await withinAct(() => { result.current.apply() })
    await flushAsync()
    const st = useReportFilterStore.getState().entities['list:expenses']
    expect(st?.filters).toMatchObject({ start: '2025-01-01', end: '2025-01-31', category: 'Meals' })
    await withinAct(() => { result.current.clear() })
    const cleared = useReportFilterStore.getState().entities['list:expenses']
    expect(cleared?.filters.start).toBe('')
    expect(cleared?.filters.end).toBe('')
    expect(cleared?.filters.category).toBe('')
  })
})
