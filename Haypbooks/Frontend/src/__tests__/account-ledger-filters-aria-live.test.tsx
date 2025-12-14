import { render, screen, fireEvent } from '@testing-library/react'
import React from 'react'
import AccountLedgerFilters from '@/components/AccountLedgerFilters'

// Mock next/navigation with mutable search string and pathname
jest.mock('next/navigation', () => {
  let search = ''
  let pathname = '/reports/ledger'
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

describe('AccountLedgerFilters aria-live announcements', () => {
  beforeEach(() => {
    // Mock accounts API
    global.fetch = jest.fn(async () => ({ ok: true, json: async () => ({ accounts: [
      { id: '1', number: '1000', name: 'Cash' },
      { id: '2', number: '2000', name: 'AP' },
    ] }) })) as any
  })
  afterEach(() => { (global.fetch as any) = undefined })

  it('announces when filters are applied and cleared', async () => {
    render(<AccountLedgerFilters />)
    // Wait for accounts to load so select has options
    await screen.findByText('1000 · Cash')

    const select = screen.getByLabelText('Account') as HTMLSelectElement
    fireEvent.change(select, { target: { value: '1000' } })

    // Apply
    const applyBtn = screen.getByRole('button', { name: 'Apply' })
    fireEvent.click(applyBtn)

    // Live region should indicate saved/applied soon after
    const applied = await screen.findByText(/Filters (saved|applied)\./i)
    expect(applied).toBeInTheDocument()

    // Clear
    fireEvent.click(screen.getByRole('button', { name: 'Clear' }))
    const cleared = await screen.findByText(/Filters saved\.|No filters applied\./i)
    expect(cleared).toBeInTheDocument()
  })
})
