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

// Mock next/navigation with internal mutable search string
jest.mock('next/navigation', () => {
  let search = ''
  return {
    usePathname: () => '/transactions',
    useSearchParams: () => new URLSearchParams(search),
    useRouter: () => ({
      replace: (href: string) => { const q = href.split('?')[1]; search = q || '' },
      push: (href: string) => { const q = href.split('?')[1]; search = q || '' },
    }),
    __setSearch: (q: string) => { search = q },
    __getSearch: () => search,
  }
})

describe('usePersistedFilterParams transactions migration', () => {
  beforeEach(() => {
    useReportFilterStore.setState({ entities: {}, activeKeys: new Set<string>() })
    jest.useFakeTimers()
  })
  afterEach(() => { jest.useRealTimers() })

  it('hydrates legacy mm/dd/yyyy and normalizes to ISO', async () => {
    useReportFilterStore.getState().entities['list:transactions'] = { filters: { start: '04/01/2025', end: '04/30/2025', type: 'Income' }, updatedAt: new Date().toISOString(), status: 'idle' }
    const normalize = (v: string) => v && v.includes('/') ? (() => { const [m,d,y] = v.split('/'); return `${y}-${m}-${d}` })() : (v||'')
    const { result } = renderHook(() => usePersistedFilterParams<{ start:string; end:string; type:string }>({ reportKey: 'list:transactions', specs: [
      { key: 'start', normalize },
      { key: 'end', normalize },
      { key: 'type' }
    ] }))
  await flushAsync()
    expect(result.current.values.start).toBe('2025-04-01')
    expect(result.current.values.end).toBe('2025-04-30')
    expect(result.current.values.type).toBe('Income')
  })

  it('apply persists and clear wipes values', async () => {
    const { result } = renderHook(() => usePersistedFilterParams<{ start:string; end:string; type:string }>({ reportKey: 'list:transactions', specs: [
      { key: 'start' }, { key: 'end' }, { key: 'type' }
    ] }))
  await flushAsync()
  await withinAct(() => { result.current.setValues((v: any) => ({ ...v, start: '2025-02-01', end: '2025-02-28', type: 'Expense' })) })
  await withinAct(() => { result.current.apply() })
    await flushAsync()
    const st = useReportFilterStore.getState().entities['list:transactions']
    expect(st?.filters).toMatchObject({ start: '2025-02-01', end: '2025-02-28', type: 'Expense' })
    await withinAct(() => { result.current.clear() })
    const cleared = useReportFilterStore.getState().entities['list:transactions']
    expect(cleared?.filters.start).toBe('')
    expect(cleared?.filters.end).toBe('')
    expect(cleared?.filters.type).toBe('')
  })
})
