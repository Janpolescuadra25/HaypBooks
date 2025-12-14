import { render } from '@testing-library/react'
import React from 'react'
import Page from '@/app/bank-transactions/page'
import { interceptActWarnings, restoreActWarningInterception, flushAsync, withinAct } from '@/test-utils/act-helpers'

// Default selection should choose remembered account if present; else first account in list

const replaceMock = jest.fn()
jest.mock('next/navigation', () => {
  const actual = jest.requireActual('next/navigation')
  return {
    ...actual,
    useRouter: () => ({ replace: replaceMock }),
    usePathname: () => '/bank-transactions',
    useSearchParams: () => new URLSearchParams('bankStatus=for_review')
  }
})

jest.mock('@/hooks/useTransactions', () => ({
  useTransactions: () => ({ transactions: [], loading: false, error: null, update: jest.fn(), refetch: jest.fn() })
}))

beforeEach(() => {
  replaceMock.mockReset()
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
  try { window.localStorage.clear() } catch {}
})

describe('Account list: default selection behavior', () => {
  test('picks first account when nothing remembered', async () => {
    interceptActWarnings({ mode: 'collect' })
    await withinAct(async () => { render(<Page />) })
    await flushAsync()
    // Should trigger a router.replace setting accountId to first account
    expect(replaceMock).toHaveBeenCalled()
    const args = replaceMock.mock.calls.map(c => String(c[0]))
    expect(args.some(s => s.includes('accountId=acc-1'))).toBe(true)
    restoreActWarningInterception()
  })

  test('uses remembered account when present', async () => {
    try { window.localStorage.setItem('bank:lastAccountId', 'acc-2') } catch {}
    interceptActWarnings({ mode: 'collect' })
    await withinAct(async () => { render(<Page />) })
    await flushAsync()
    expect(replaceMock).toHaveBeenCalled()
    const args = replaceMock.mock.calls.map(c => String(c[0]))
    expect(args.some(s => s.includes('accountId=acc-2'))).toBe(true)
    restoreActWarningInterception()
  })
})
