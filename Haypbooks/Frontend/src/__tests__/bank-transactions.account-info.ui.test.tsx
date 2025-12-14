import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import React from 'react'
import Page from '@/app/bank-transactions/page'
import { withinAct, flushAsync, interceptActWarnings, restoreActWarningInterception } from '@/test-utils/act-helpers'

// Mock next/navigation to include an accountId so the button appears
jest.mock('next/navigation', () => {
  const actual = jest.requireActual('next/navigation')
  return {
    ...actual,
    useRouter: () => ({ replace: jest.fn() }),
    usePathname: () => '/bank-transactions',
    useSearchParams: () => new URLSearchParams('bankStatus=for_review&accountId=acc-1')
  }
})

jest.mock('@/hooks/useTransactions', () => ({
  useTransactions: () => ({ transactions: [], loading: false, error: null, update: jest.fn(), refetch: jest.fn() })
}))

beforeEach(() => {
  // @ts-ignore
  global.fetch = jest.fn((url: string) => {
    if (url.startsWith('/api/user/profile')) {
      return Promise.resolve(new Response(JSON.stringify({ permissions: ['journal:read','reports:read'] })))
    }
    if (url.startsWith('/api/transactions')) {
      return Promise.resolve(new Response(JSON.stringify({ total: 0, rows: [] })))
    }
    if (url.startsWith('/api/accounts/balance-summary')) {
      return Promise.resolve(new Response(JSON.stringify({
        account: { id: 'acc-1', number: '1000', name: 'Checking' },
        booksBalance: 1200.25,
        bankBalance: 1195.25,
        differenceToBooks: -5.00,
        statementBalance: 1180.00,
        statementDate: '2025-09-30'
      })))
    }
    if (url.startsWith('/api/accounts')) {
      return Promise.resolve(new Response(JSON.stringify({ accounts: [{ id: 'acc-1', name: 'Checking', number: '1000' }] })))
    }
    return Promise.resolve(new Response(JSON.stringify({})))
  })
})

describe.skip('Bank Transactions: Account details dialog (removed)', () => {
  test('no-op', async () => {
    interceptActWarnings({ mode: 'collect' })
    render(<Page />)
    restoreActWarningInterception()
  })
})
