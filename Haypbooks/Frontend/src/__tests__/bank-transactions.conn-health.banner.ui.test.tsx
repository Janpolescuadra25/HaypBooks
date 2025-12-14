import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import React from 'react'
import Page from '@/app/bank-transactions/page'
import { withinAct, flushAsync, interceptActWarnings, restoreActWarningInterception } from '@/test-utils/act-helpers'

// Mock next/navigation to inject bankConn query param
jest.mock('next/navigation', () => {
  const actual = jest.requireActual('next/navigation')
  return {
    ...actual,
    useRouter: () => ({ replace: jest.fn() }),
    usePathname: () => '/bank-transactions',
    useSearchParams: () => new URLSearchParams('bankStatus=for_review&bankConn=reauth')
  }
})

jest.mock('@/hooks/useTransactions', () => ({
  useTransactions: () => ({ transactions: [], loading: false, error: null, update: jest.fn(), refetch: jest.fn() })
}))

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

describe('Bank Transactions: Connection health banner', () => {
  test('shows reauth banner, opens Link bank dialog, and dismisses', async () => {
    interceptActWarnings({ mode: 'collect' })
    const user = userEvent.setup()
    render(<Page />)

    const region = await screen.findByRole('region', { name: /Bank connection health/i })
    expect(region).toBeInTheDocument()
    expect(region).toHaveTextContent(/Re-authentication required/i)

    // CTA should open the Link bank dialog
    const cta = await screen.findByRole('button', { name: /Open Link bank dialog|Re-authenticate|Open Link bank/i })
    await withinAct(async () => { await user.click(cta) })
    await flushAsync()
    expect(await screen.findByRole('dialog', { name: /Link bank account/i })).toBeInTheDocument()

    // Close dialog and dismiss banner
    const close = await screen.findByRole('button', { name: /Close link bank dialog/i })
    await withinAct(async () => { await user.click(close) })
    await flushAsync()

    const dismiss = await screen.findByRole('button', { name: /Dismiss bank connection banner/i })
    await withinAct(async () => { await user.click(dismiss) })
    await flushAsync()

    expect(screen.queryByRole('region', { name: /Bank connection health/i })).not.toBeInTheDocument()
    restoreActWarningInterception()
  })
})
