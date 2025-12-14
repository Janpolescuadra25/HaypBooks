import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import React from 'react'
import Page from '@/app/bank-transactions/page'
import { withinAct, flushAsync, interceptActWarnings, restoreActWarningInterception } from '@/test-utils/act-helpers'

// Basic mock for next/navigation hooks used by the page
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

// Mock network calls used during initial render
beforeEach(() => {
  // @ts-ignore
  global.fetch = jest.fn((url: string) => {
    if (url.startsWith('/api/user/profile')) {
      return Promise.resolve(new Response(JSON.stringify({ permissions: ['journal:write'] })))
    }
    if (url.startsWith('/api/transactions')) {
      return Promise.resolve(new Response(JSON.stringify({ total: 0, rows: [] })))
    }
    if (url.startsWith('/api/accounts')) {
      return Promise.resolve(new Response(JSON.stringify({ accounts: [] })))
    }
    return Promise.resolve(new Response(JSON.stringify({})))
  })
})

describe('Bank Transactions: Link bank control', () => {
  test('shows Link bank button and opens/closes dialog with Escape and Close', async () => {
    // Collect act warnings instead of throwing to avoid unrelated background effects breaking this focused UI test
    interceptActWarnings({ mode: 'collect' })
    const user = userEvent.setup()
    render(<Page />)

    const btn = await screen.findByRole('button', { name: /Link bank/i })
    expect(btn).toBeInTheDocument()

    await withinAct(async () => { await user.click(btn) })
    await flushAsync()

    const dialog = await screen.findByRole('dialog', { name: /Link bank account/i })
    expect(dialog).toBeInTheDocument()

    // Escape closes
    await withinAct(async () => { await user.keyboard('{Escape}') })
    await flushAsync()
    expect(screen.queryByRole('dialog', { name: /Link bank account/i })).not.toBeInTheDocument()

    // Open again and close via button
    await withinAct(async () => { await user.click(screen.getByRole('button', { name: /Link bank/i })) })
    await flushAsync()
    const close = await screen.findByRole('button', { name: /Close link bank dialog/i })
    await withinAct(async () => { await user.click(close) })
    await flushAsync()
    expect(screen.queryByRole('dialog', { name: /Link bank account/i })).not.toBeInTheDocument()

    // Restore console interception if it was enabled
    restoreActWarningInterception()
  })
})
