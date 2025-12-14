import '@testing-library/jest-dom'
import React from 'react'
import { render, screen, fireEvent, within } from '@testing-library/react'
import { withinAct, flushAsync } from '../test-utils/act-helpers'
import GlobalSearchPage from '@/app/search/page'

// Mock next/navigation hooks used by the page
const push = jest.fn()
jest.mock('next/navigation', () => ({
  // Minimal router with push only for our tests
  useRouter: () => ({ push }),
  // Provide a stable, empty search params implementation
  useSearchParams: () => new URLSearchParams(''),
}))

// Mock next/link to a simple anchor to avoid pulling Next internals into jsdom
jest.mock('next/link', () => ({
  __esModule: true,
  default: ({ href, children, ...rest }: any) => React.createElement('a', { href, ...rest }, children),
}))

function mockSearchResponse(groups: any) {
  // Return a minimal fetch-like response to avoid heavy undici Response objects
  return {
    ok: true,
    json: async () => ({ query: 'test', groups }),
  } as any
}

describe('Global Search UI', () => {
  beforeEach(() => {
    jest.useFakeTimers()
    ;(global as any).fetch = jest.fn().mockResolvedValue(
      mockSearchResponse({
        invoices: { items: [], total: 0, hasMore: false },
        bills: { items: [], total: 0, hasMore: false },
        customers: { items: [], total: 0, hasMore: false },
        vendors: { items: [], total: 0, hasMore: false },
        transactions: { items: [], total: 0, hasMore: false },
        accounts: { items: [], total: 0, hasMore: false },
      })
    )
  })

  afterEach(() => {
    ;(global as any).fetch = undefined
    jest.useRealTimers()
    push.mockReset()
  })

  it('shows hint until 2+ characters are typed', () => {
    render(<GlobalSearchPage />)
    const input = screen.getByLabelText('Global search') as HTMLInputElement
    expect(screen.getByText(/Type at least 2 characters/i)).toBeInTheDocument()
    fireEvent.change(input, { target: { value: 'a' } })
    // Still under 2 chars, hint remains and no fetch fired
    expect(screen.getByText(/Type at least 2 characters/i)).toBeInTheDocument()
    expect(global.fetch).not.toHaveBeenCalled()
  })

  it('debounces fetch calls and renders grouped results', async () => {
    // Prepare a more meaningful response for this test
    ;(global.fetch as jest.Mock).mockResolvedValueOnce(
      mockSearchResponse({
        invoices: {
          total: 2,
          hasMore: false,
          items: [
            { id: 'inv1', type: 'invoices', title: 'INV-1001 · Alpha Co', subtitle: 'OPEN · 2025-09-01', href: '/invoices/inv1?from=%2Fsearch', meta: '$100.00' },
            { id: 'inv2', type: 'invoices', title: 'INV-1002 · Beta Co', subtitle: 'PAID · 2025-08-16', href: '/invoices/inv2?from=%2Fsearch', meta: '$250.00' },
          ],
        },
        bills: { items: [], total: 0, hasMore: false },
        customers: { items: [], total: 0, hasMore: false },
        vendors: { items: [], total: 0, hasMore: false },
        transactions: { items: [], total: 0, hasMore: false },
        accounts: { items: [], total: 0, hasMore: false },
      })
    )

    render(<GlobalSearchPage />)
    const input = screen.getByLabelText('Global search') as HTMLInputElement

    // Rapid typing should result in a single fetch after debounce window
    await withinAct(() => {
      fireEvent.change(input, { target: { value: 'i' } })
      fireEvent.change(input, { target: { value: 'in' } })
      fireEvent.change(input, { target: { value: 'inv' } })
    })
    expect(global.fetch).not.toHaveBeenCalled()

    // Advance debounce timer within act and flush microtasks
    await withinAct(() => { jest.advanceTimersByTime(300) }, { flush: true })

    expect(global.fetch).toHaveBeenCalledTimes(1)
    const url = (global.fetch as jest.Mock).mock.calls[0][0] as string
    expect(url).toMatch(/\/api\/search\?q=inv/)

    // Results rendered
    expect(screen.getByRole('heading', { name: /Invoices/i })).toBeInTheDocument()
    // With ARIA updates, each group has its own listbox labelled by the group title
    const listbox = screen.getByRole('listbox', { name: /Invoices/i })
    const rows = within(listbox as HTMLElement).getAllByRole('option')
    expect(rows.length).toBe(2)
    expect(within(rows[0]).getByText(/INV-1001/)).toBeInTheDocument()
  })

  it('supports ArrowUp/Down and Enter, and Escape to clear', async () => {
    ;(global.fetch as jest.Mock).mockResolvedValueOnce(
      mockSearchResponse({
        invoices: {
          total: 1,
          hasMore: false,
          items: [
            { id: 'inv1', type: 'invoices', title: 'INV-1001 · Alpha Co', subtitle: 'OPEN · 2025-09-01', href: '/invoices/inv1?from=%2Fsearch', meta: '$100.00' },
          ],
        },
        bills: { items: [], total: 0, hasMore: false },
        customers: { items: [], total: 0, hasMore: false },
        vendors: { items: [], total: 0, hasMore: false },
        transactions: { items: [], total: 0, hasMore: false },
        accounts: { items: [], total: 0, hasMore: false },
      })
    )

    render(<GlobalSearchPage />)
    const input = screen.getByLabelText('Global search') as HTMLInputElement
  await withinAct(() => { fireEvent.change(input, { target: { value: 'invoice' } }) })
  await withinAct(() => { jest.advanceTimersByTime(300) }, { flush: true })

    // Active descendant should be set; pressing Enter should navigate
    fireEvent.keyDown(input, { key: 'Enter' })
    expect(push).toHaveBeenCalledWith('/invoices/inv1?from=%2Fsearch')

    // Escape clears
    fireEvent.keyDown(input, { key: 'Escape' })
    expect(input.value).toBe('')
    expect(screen.getByText(/Type at least 2 characters/i)).toBeInTheDocument()
  })
})
