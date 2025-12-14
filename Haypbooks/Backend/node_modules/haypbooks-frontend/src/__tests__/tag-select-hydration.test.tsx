import { render, screen } from '@testing-library/react'
import React from 'react'
import TagSelect from '@/components/TagSelect'
import { useReportFilterStore } from '@/stores/reportFilters'
import { flushAsync, interceptActWarnings, restoreActWarningInterception } from '../test-utils/act-helpers'

// Mock next/navigation with empty initial search; ensure path is report page
jest.mock('next/navigation', () => {
  let search = ''
  let pathname = '/reports/sales-by-customer-summary'
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

// Mock preferences API with in-memory store
jest.mock('@/lib/preferences', () => {
  const db: Record<string, any> = {}
  return {
    getReportFilters: async (k: string) => db[k] || { filters: {}, updatedAt: new Date().toISOString() },
    setReportFilters: async (k: string, filters: any) => { db[k] = { filters, updatedAt: new Date().toISOString() }; return db[k] }
  }
})

describe('TagSelect hydration from persisted filters', () => {
  beforeEach(() => {
    jest.useFakeTimers()
    interceptActWarnings({ mode: 'throw' })
    useReportFilterStore.setState({ entities: {}, activeKeys: new Set<string>() })
    // Mock tags fetch so the dropdown renders
    global.fetch = jest.fn(async () => ({ ok: true, json: async () => ({ tags: [ { id: 'tA', name: 'Alpha' } ] }) })) as any
  })
  afterEach(() => {
    jest.runOnlyPendingTimers()
    jest.useRealTimers()
    ;(global.fetch as any) = undefined
    restoreActWarningInterception()
  })

  it('hydrates tag from store when URL is empty', async () => {
    // Seed store with a saved tag for this page
    useReportFilterStore.getState().entities['filters:/reports/sales-by-customer-summary'] = {
      filters: { tag: 'tA' },
      updatedAt: new Date().toISOString(),
      status: 'idle'
    } as any

    render(<TagSelect />)
    await flushAsync()

    const select = screen.getByLabelText('Tag') as HTMLSelectElement
    expect(select.value).toBe('tA')
  })
})
