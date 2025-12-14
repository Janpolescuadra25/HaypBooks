import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import React from 'react'
import Page from '@/app/bank-transactions/page'
import { withinAct, flushAsync, interceptActWarnings, restoreActWarningInterception } from '@/test-utils/act-helpers'

// No selected account; collapsed view should show All accounts row
jest.mock('next/navigation', () => {
  const actual = jest.requireActual('next/navigation')
  return {
    ...actual,
    useRouter: () => ({ replace: jest.fn() }),
    usePathname: () => '/bank-transactions',
    useSearchParams: () => new URLSearchParams('bankStatus=for_review')
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
      ] })))
    }
    if (url.startsWith('/api/accounts/balance-summary')) {
      const id = new URL(url, 'http://test').searchParams.get('accountId')
      const map: Record<string, any> = {
        'acc-1': { bankBalance: 150.00, booksBalance: 150.00 },
        'acc-2': { bankBalance: 50.00, booksBalance: 150.00 },
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

describe('Account list: collapsed All accounts behavior', () => {
  test('collapsed shows All accounts totals in toggle row; expanded list has no clickable All accounts and bottom header shows Total', async () => {
    interceptActWarnings({ mode: 'collect' })
    const user = userEvent.setup()
    render(<Page />)

    // Toggle should show All accounts when nothing selected
    const toggle = await screen.findByRole('button', { name: /Select account All accounts/i })
    expect(toggle).toBeInTheDocument()

    // Ensure chooser is closed by default (collapsed)
    expect(screen.queryByRole('region', { name: /Choose account/i })).toBeNull()

  // Expand to confirm the list renders and All accounts is not clickable; bottom header shows Total
    await withinAct(async () => { await user.click(toggle) })
    await flushAsync()
  const chooser = await screen.findByRole('region', { name: /Choose account/i })
  const list = chooser.querySelector('ul') as HTMLElement
  expect(list).toBeTruthy()
  // All accounts should not be clickable in the list
  expect(within(list).queryByRole('button', { name: /Select account All accounts/i })).toBeNull()
  // Bottom header shows the Total label
  const totalLabel = screen.getByText(/^Total$/i)
  expect(totalLabel).toBeInTheDocument()

    restoreActWarningInterception()
  })
})
