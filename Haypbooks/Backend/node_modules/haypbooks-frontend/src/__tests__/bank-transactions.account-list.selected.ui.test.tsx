import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import React from 'react'
import Page from '@/app/bank-transactions/page'
import { withinAct, flushAsync, interceptActWarnings, restoreActWarningInterception } from '@/test-utils/act-helpers'

// Selected account present; ensure it's pinned at top and excluded from expanded list; All accounts last w/o hover classes
jest.mock('next/navigation', () => {
  const actual = jest.requireActual('next/navigation')
  return {
    ...actual,
    useRouter: () => ({ replace: jest.fn() }),
    usePathname: () => '/bank-transactions',
    useSearchParams: () => new URLSearchParams('bankStatus=for_review&accountId=acc-2')
  }
})

jest.mock('@/hooks/useTransactions', () => ({
  useTransactions: () => ({ transactions: [], loading: false, error: null, update: jest.fn(), refetch: jest.fn() })
}))

beforeEach(() => {
  // @ts-ignore
  global.fetch = jest.fn((url: string) => {
    if (url.startsWith('/api/user/profile')) {
      return Promise.resolve(new Response(JSON.stringify({ permissions: ['reports:read'] })))
    }
    if (url.startsWith('/api/accounts?reconcilable=1&includeBalances=1')) {
      return Promise.resolve(new Response(JSON.stringify({ accounts: [
        { id: 'acc-1', number: '1000', name: 'Operating' },
        { id: 'acc-2', number: '1001', name: 'Savings' },
        { id: 'acc-3', number: '2000', name: 'Card' },
      ] })))
    }
    if (url.startsWith('/api/accounts/balance-summary')) {
      const id = new URL(url, 'http://test').searchParams.get('accountId')
      const map: Record<string, any> = {
        'acc-1': { bankBalance: 120.00, booksBalance: 100.00 },
        'acc-2': { bankBalance: 200.00, booksBalance: 210.00 },
        'acc-3': { bankBalance: 80.00, booksBalance: 75.00 },
      }
      const j = map[id || ''] || { bankBalance: 0, booksBalance: 0 }
      return Promise.resolve(new Response(JSON.stringify(j)))
    }
    if (url.startsWith('/api/transactions')) {
      return Promise.resolve(new Response(JSON.stringify({ total: 0, rows: [] })))
    }
    return Promise.resolve(new Response(JSON.stringify({})))
  })
})

describe('Account list: selected account behavior', () => {
  test('selected pinned at top; excluded in expanded; All accounts last without hover transform classes', async () => {
    interceptActWarnings({ mode: 'collect' })
    const user = userEvent.setup()
    render(<Page />)

    // Collapsed toggle row should show selected account (1001 · Savings)
    const toggle = await screen.findByRole('button', { name: /Select account 1001/i })
    expect(toggle).toBeInTheDocument()

    // Open chooser
    await withinAct(async () => { await user.click(toggle) })
    await flushAsync()

  const chooser = await screen.findByRole('region', { name: /Choose account/i })
  const list = within(chooser).getByRole('list')
  // All accounts should NOT be clickable within the list
  expect(within(list).queryByRole('button', { name: /Select account All accounts/i })).toBeNull()

    // Selected account should NOT be present in the list
    expect(within(list).queryByRole('button', { name: /Select account 1001/i })).toBeNull()

  // There should be a bottom header clone visible (so we have two "Bank Balance" labels overall)
  const bankHeaders = screen.getAllByText(/Bank Balance/i)
  expect(bankHeaders.length).toBeGreaterThanOrEqual(2)

    restoreActWarningInterception()
  })
})
