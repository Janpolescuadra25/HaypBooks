import { render, screen, fireEvent } from '@testing-library/react'
import React from 'react'
import StandardReportFilters from '@/components/StandardReportFilters'

// Mock next/navigation similar to other a11y tests so App Router hooks work
jest.mock('next/navigation', () => {
  let search = ''
  let pathname = '/reports/standard/retail-sales-by-channel'
  return {
    useSearchParams: () => new URLSearchParams(search),
    usePathname: () => pathname,
    useRouter: () => ({
      replace: (href: string) => { const q = href.split('?')[1]; search = q || '' },
      push: (href: string) => { const q = href.split('?')[1]; search = q || '' },
    }),
    __setSearch: (q: string) => { search = q },
    __getSearch: () => search,
    __setPath: (p: string) => { pathname = p },
  }
})

describe('StandardReportFilters aria-live announcements', () => {
  beforeEach(() => {
    // Minimal fetch mock for preferences load/save used by usePersistedFilterParams
    global.fetch = jest.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
      const method = (init?.method || 'GET').toUpperCase()
      // Return an empty preference object for both GET and PUT calls
      return {
        ok: true,
        json: async () => ({ filters: {}, updatedAt: new Date(0).toISOString() })
      } as any
    }) as any
  })
  afterEach(() => { (global.fetch as any) = undefined })

  it('announces active vs none when applying and resetting', async () => {
    render(<StandardReportFilters slug="retail-sales-by-channel" />)

    // Initially, there should be no active filters
    const none = await screen.findByText('No filters active')
    expect(none).toBeInTheDocument()

    // Change the select to a specific option; applies immediately
    const select = screen.getByLabelText('Channel') as HTMLSelectElement
    fireEvent.change(select, { target: { value: 'Online' } })

    const active = await screen.findByText('Filter active')
    expect(active).toBeInTheDocument()

    // Click Reset and expect the announcement to toggle back
    const resetBtn = screen.getByRole('button', { name: 'Reset' })
    fireEvent.click(resetBtn)

    const noneAgain = await screen.findByText('No filters active')
    expect(noneAgain).toBeInTheDocument()
  })
})
