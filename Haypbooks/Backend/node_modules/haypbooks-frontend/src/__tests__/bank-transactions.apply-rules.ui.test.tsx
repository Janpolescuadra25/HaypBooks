import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { withinAct, flushAsync, interceptActWarnings, restoreActWarningInterception } from '../test-utils/act-helpers'

// Mock next/navigation to keep URL state in-memory
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
    __setSearch: (q: string) => { search = q },
    __getSearch: () => search,
    __setPath: (p: string) => { pathname = p }
  }
})

import BankTransactionsPage from '@/app/bank-transactions/page'

describe('Bank Transactions: Apply rules action', () => {
  const realFetch = global.fetch

  beforeEach(() => {
    // Seed a small state: 2 for_review (including one imported), 1 categorized
    const state = {
      rows: [
        { id: 't1', date: '2025-01-10', description: 'ONLINE SALE', category: 'Income', amount: 100, accountId: 'a1', bankStatus: 'imported' },
        { id: 't2', date: '2025-01-11', description: 'COFFEE SHOP', category: 'Expense', amount: -5, accountId: 'a1', bankStatus: 'for_review' },
        { id: 't3', date: '2025-01-05', description: 'PHONE BILL', category: 'Expense', amount: -45, accountId: 'a1', bankStatus: 'categorized' },
      ]
    }
    global.fetch = (jest.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = typeof input === 'string' ? input : input.toString()
      const method = (init?.method || 'GET').toUpperCase()
      if (url.startsWith('/api/user/profile')) {
        return { ok: true, json: async () => ({ permissions: ['journal:write'] }) } as any
      }
      if (url.startsWith('/api/transactions')) {
        if (method === 'GET') {
          const u = new URL(url, 'http://localhost')
          const status = u.searchParams.get('bankStatus') || 'for_review'
          const page = Number(u.searchParams.get('page') || '1')
          const limit = Number(u.searchParams.get('limit') || '20')
          let filtered = state.rows.slice()
          if (status === 'for_review') filtered = filtered.filter(r => (r.bankStatus || 'for_review') === 'for_review' || r.bankStatus === 'imported')
          else filtered = filtered.filter(r => (r.bankStatus || 'for_review') === status)
          const slice = filtered.slice((page-1)*limit, (page-1)*limit + limit)
          return { ok: true, json: async () => ({ transactions: slice, total: filtered.length, page, limit }) } as any
        }
      }
      if (url.startsWith('/api/bank-feeds/apply-rules')) {
        // Simulate rules categorizing one imported row
        const t = state.rows.find(r => r.bankStatus === 'imported')
        if (t) t.bankStatus = 'categorized'
        return { ok: true, json: async () => ({ updated: 1 }) } as any
      }
      return { ok: true, json: async () => ({}) } as any
    }) as any)
  })

  afterEach(() => { global.fetch = realFetch as any })

  it('applies rules and refreshes tab counts', async () => {
    restoreActWarningInterception(); interceptActWarnings({ mode: 'collect' })
    const user = userEvent.setup()
    render(<BankTransactionsPage />)

    // Tabs appear with counts; For Review should show 2 initially
    const forReviewTab = await screen.findByRole('tab', { name: /For Review \(2\)/i })
    expect(forReviewTab).toBeInTheDocument()

    // Click Apply rules; wait for counts to update
    const applyBtn = await screen.findByRole('button', { name: /Apply rules/i })
    await withinAct(async () => { await user.click(applyBtn) })
    await flushAsync()

    // After rules: one imported becomes categorized, so For Review count -> 1, Categorized -> 2
    await waitFor(() => {
      expect(screen.getByRole('tab', { name: /For Review \(1\)/i })).toBeInTheDocument()
      expect(screen.getByRole('tab', { name: /Categorized \(2\)/i })).toBeInTheDocument()
    })
  })
})
