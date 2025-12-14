import { renderHook, act } from '@testing-library/react'
import usePersistedFilterParams from '../hooks/usePersistedFilterParams'
import { useReportFilterStore } from '@/stores/reportFilters'

jest.mock('@/lib/preferences', () => {
  const db: Record<string, any> = {}
  return {
    getReportFilters: async (k: string) => db[k] || { filters: {}, updatedAt: new Date().toISOString() },
    setReportFilters: async (k: string, filters: any) => { db[k] = { filters, updatedAt: new Date().toISOString() }; return db[k] }
  }
})

// Mock next/navigation for bills scenario with legacy mm/dd/yyyy values
jest.mock('next/navigation', () => {
  const actual = jest.requireActual('next/navigation')
  let search = 'start=03/15/2025&end=03/20/2025'
  return {
    ...actual,
    usePathname: () => '/bills',
    useSearchParams: () => new URLSearchParams(search),
    useRouter: () => ({
      replace: (href: string) => { const q = href.split('?')[1]; search = q || '' },
      push: (href: string) => { const q = href.split('?')[1]; search = q || '' },
    }),
  }
})

describe('usePersistedFilterParams bills normalization', () => {
  it('normalizes legacy mm/dd/yyyy to ISO', async () => {
    const { result } = renderHook(() => usePersistedFilterParams<{ start: string; end: string; status: string }>({
      reportKey: 'list:bills-test',
      specs: [
        { key: 'start', normalize: v => { if(!v) return ''; if(/^\d{2}\/\d{2}\/\d{4}$/.test(v)){ const [mo,d,y]=v.split('/'); return `${y}-${mo}-${d}` } return v }, },
        { key: 'end', normalize: v => { if(!v) return ''; if(/^\d{2}\/\d{2}\/\d{4}$/.test(v)){ const [mo,d,y]=v.split('/'); return `${y}-${mo}-${d}` } return v }, },
        { key: 'status' },
      ]
    }))
    await act(async () => {})
    expect(result.current.values.start).toBe('2025-03-15')
    expect(result.current.values.end).toBe('2025-03-20')
  })
})
