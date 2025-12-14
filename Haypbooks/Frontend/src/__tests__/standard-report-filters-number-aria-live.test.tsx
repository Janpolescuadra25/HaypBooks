import { render, screen, fireEvent } from '@testing-library/react'
import React from 'react'
import StandardReportFilters from '@/components/StandardReportFilters'

// Mock next/navigation similar to other a11y tests so App Router hooks work
jest.mock('next/navigation', () => {
  let search = ''
  let pathname = '/reports/standard/construction-job-profitability'
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

describe('StandardReportFilters number input aria-live announcements', () => {
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

  it('announces active on change, remains after blur, and resets back to none', async () => {
    render(<StandardReportFilters slug="construction-job-profitability" />)

    // Initially, no active filters
    const none = await screen.findByText('No filters active')
    expect(none).toBeInTheDocument()

  // Type value; number inputs apply on blur for persistence, but the UI's
  // live region reflects active state immediately when a value is present
    const input = screen.getByLabelText('Min margin %') as HTMLInputElement
    fireEvent.change(input, { target: { value: '25' } })

  // Live region should already indicate an active filter before blur
  const activePreBlur = await screen.findByText('Filter active')
  expect(activePreBlur).toBeInTheDocument()

    // Now blur to commit apply
    fireEvent.blur(input)

  const activePostBlur = await screen.findByText('Filter active')
  expect(activePostBlur).toBeInTheDocument()

    // Click Reset and expect the announcement to toggle back
    const resetBtn = screen.getByRole('button', { name: 'Reset' })
    fireEvent.click(resetBtn)

    const noneAgain = await screen.findByText('No filters active')
    expect(noneAgain).toBeInTheDocument()
  })
})
