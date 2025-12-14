import { render, screen, fireEvent } from '@testing-library/react'
import React from 'react'
import TagSelect from '@/components/TagSelect'
import { useReportFilterStore } from '@/stores/reportFilters'
import { flushAsync, withinAct, interceptActWarnings, restoreActWarningInterception } from '../test-utils/act-helpers'

// Mock next/navigation with mutable search string and pathname
jest.mock('next/navigation', () => {
  let search = ''
  let pathname = '/reports/sales-by-product-summary'
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

describe('TagSelect persistence and URL sync', () => {
  beforeEach(() => {
    jest.useFakeTimers()
    interceptActWarnings({ mode: 'throw' })
    // Reset store
    useReportFilterStore.setState({ entities: {}, activeKeys: new Set<string>() })
    // Mock fetch for tags
    global.fetch = jest.fn(async () => ({ ok: true, json: async () => ({ tags: [ { id: 't1', name: 'Tag One' }, { id: 't2', name: 'Tag Two' } ] }) })) as any
  })
  afterEach(() => {
    jest.runOnlyPendingTimers()
    jest.useRealTimers()
    ;(global.fetch as any) = undefined
    restoreActWarningInterception()
  })

  it('saves selected tag and updates URL', async () => {
    render(<TagSelect />)

  // Wait a tick for initial fetch and hydration
  await flushAsync()

    const select = screen.getByLabelText('Tag') as HTMLSelectElement
    // Ensure options include our mocked tags
    expect(select.options.length).toBeGreaterThan(1)

    // Change selection to t1
  await withinAct(() => { fireEvent.change(select, { target: { value: 't1' } }) })

    // Debounced save
  await withinAct(() => { jest.advanceTimersByTime(600) })

    // Verify store persisted under filters:<pathname>
    const st = useReportFilterStore.getState().entities['filters:/reports/sales-by-product-summary']
    expect(st?.filters.tag).toBe('t1')

    // Verify URL query contains tag=t1
    const nav = require('next/navigation')
    const q = nav.__getSearch() as string
    const sp = new URLSearchParams(q)
    expect(sp.get('tag')).toBe('t1')
  })
})
