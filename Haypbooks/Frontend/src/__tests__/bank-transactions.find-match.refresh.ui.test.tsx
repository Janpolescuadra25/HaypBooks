import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import React from 'react'
import Page from '@/app/bank-transactions/page'
import { withinAct, flushAsync, interceptActWarnings, restoreActWarningInterception } from '@/test-utils/act-helpers'

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
  useTransactions: () => ({
    transactions: [
      { id: 't1', date: '2025-01-01', description: 'Deposit A', category: 'Income', amount: 100, accountId: '' }
    ],
    loading: false,
    error: null,
    update: jest.fn(),
    refetch: jest.fn()
  })
}))

describe('Find match panel: Refresh button', () => {
  beforeEach(() => {
    let invoiceCalls = 0
    // @ts-ignore
    global.fetch = jest.fn((url: string) => {
      if (url.startsWith('/api/user/profile')) {
        return Promise.resolve(new Response(JSON.stringify({ permissions: ['journal:write'] })))
      }
      if (url.startsWith('/api/accounts?reconcilable=1&includeBalances=1')) {
        return Promise.resolve(new Response(JSON.stringify({ accounts: [] })))
      }
      if (url.startsWith('/api/transactions')) {
        return Promise.resolve(new Response(JSON.stringify({ total: 1, rows: [] })))
      }
      if (url.startsWith('/api/invoices')) {
        invoiceCalls += 1
        return Promise.resolve(new Response(JSON.stringify({ invoices: [ { id: 'inv1', number: 'INV-1', name: 'Acme', date: '2025-01-02', balance: 100 } ] })))
      }
      // Exclude match suggestions, not needed here
      return Promise.resolve(new Response(JSON.stringify({})))
    })
    // expose for assertion in tests via closure capture
    // @ts-ignore
    global.__invoiceCalls = () => (invoiceCalls)
  })

  test('shows Refresh and refetches invoices on click', async () => {
    interceptActWarnings({ mode: 'collect' })
    const user = userEvent.setup()
    render(<Page />)

    // Click the row to expand
    const row = await screen.findByText('Deposit A')
    await withinAct(async () => { await user.click(row) })
    await flushAsync()

    // Open Find match panel
    const findMatch = await screen.findByRole('button', { name: /Open manual match panel/i })
    await withinAct(async () => { await user.click(findMatch) })
    await flushAsync()

    // Should auto-load invoices once
    const firstCount = (global as any).__invoiceCalls()
    expect(firstCount).toBe(1)

    // Click Refresh
    const refreshBtn = await screen.findByRole('button', { name: /Refresh available matches/i })
    await withinAct(async () => { await user.click(refreshBtn) })
    await flushAsync()

    const secondCount = (global as any).__invoiceCalls()
    expect(secondCount).toBeGreaterThan(1)

    restoreActWarningInterception()
  })
})
