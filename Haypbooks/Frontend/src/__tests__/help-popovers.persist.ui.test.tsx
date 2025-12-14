import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { withinAct, flushAsync, interceptActWarnings, restoreActWarningInterception } from '../test-utils/act-helpers'

// Mock next/navigation for in-memory routing
jest.mock('next/navigation', () => {
  let search = ''
  let pathname = '/bank-transactions'
  return {
    usePathname: () => pathname,
    useSearchParams: () => new URLSearchParams(search),
    useRouter: () => ({
      replace: (href: string) => { const q = href.split('?')[1]; search = q || '' },
      push: (href: string) => { const q = href.split('?')[1]; search = q || '' },
      refresh: jest.fn(),
    }),
  }
})

import BankTransactionsPage from '@/app/bank-transactions/page'

describe("Help popovers persistence", () => {
  const realFetch = global.fetch
  beforeEach(() => {
    restoreActWarningInterception(); interceptActWarnings({ mode: 'collect' }); localStorage.clear()
    // Minimal fetch stubs to avoid error UI
    const state = { rows: [] as any[] }
    global.fetch = (jest.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = typeof input === 'string' ? input : input.toString()
      const method = (init?.method || 'GET').toUpperCase()
      if (url.startsWith('/api/user/profile')) {
        return { ok: true, json: async () => ({ permissions: ['journal:write'] }) } as any
      }
      if (url.startsWith('/api/transactions') && method === 'GET') {
        const u = new URL(url, 'http://localhost')
        const status = u.searchParams.get('bankStatus') || 'for_review'
        let filtered = state.rows.slice()
        if (status === 'for_review') filtered = filtered.filter(r => (r.bankStatus || 'for_review') === 'for_review' || r.bankStatus === 'imported')
        else filtered = filtered.filter(r => (r.bankStatus || 'for_review') === status)
        return { ok: true, json: async () => ({ transactions: filtered, total: filtered.length, page: 1, limit: 20 }) } as any
      }
      return { ok: true, json: async () => ({}) } as any
    }) as any)
  })
  afterEach(() => { global.fetch = realFetch as any })

  it("respects 'Don't show again' for bank review", async () => {
    const user = userEvent.setup()
    render(<BankTransactionsPage />)
    const helpBtn = await screen.findByRole('button', { name: /show bank review strategy/i })
  await withinAct(async () => { await user.click(helpBtn) })
  await flushAsync()
    const dialog = await screen.findByRole('dialog', { name: /bank review strategy/i })
    expect(dialog).toBeInTheDocument()
    const checkbox = await screen.findByRole('checkbox', { name: /don’t show again/i })
  await withinAct(async () => { await user.click(checkbox) })
  await flushAsync()
    // Close, then attempt to reopen; should not open
    const close = await screen.findByRole('button', { name: /close/i })
  await withinAct(async () => { await user.click(close) })
  await flushAsync()
  await withinAct(async () => { await user.click(helpBtn) })
  await flushAsync()
    expect(screen.queryByRole('dialog', { name: /bank review strategy/i })).not.toBeInTheDocument()
  })
})
