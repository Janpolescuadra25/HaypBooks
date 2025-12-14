import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
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
    __setSearch: (q: string) => { search = q },
    __getSearch: () => search,
    __setPath: (p: string) => { pathname = p }
  }
})

import BankTransactionsPage from '@/app/bank-transactions/page'

describe('Bank Feeds: Upload CSV Notice', () => {
  const realFetch = global.fetch

  beforeEach(() => {
    restoreActWarningInterception(); interceptActWarnings({ mode: 'collect' })
    const state = {
      rows: [
        { id: 'x1', date: '2025-01-01', description: 'Opening', category: 'Income', amount: 100, accountId: 'a1', bankStatus: 'for_review' },
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
      if (url.startsWith('/api/bank-feeds/upload')) {
        // Simulate server-side parsing result
        return { ok: true, json: async () => ({ added: 3, duplicates: 1, skipped: 2, totalRows: 6 }) } as any
      }
      return { ok: true, json: async () => ({}) } as any
    }) as any)
  })

  afterEach(() => { global.fetch = realFetch as any })

  it('shows Notice with added/duplicates/skipped after upload', async () => {
    const user = userEvent.setup()
    render(<BankTransactionsPage />)

    // Ensure we are on For Review tab
    await screen.findByRole('tab', { name: /For Review \(1\)/i })

    // Trigger upload via input
    const file = new File([`Date,Description,Amount\n`], 'bank.csv', { type: 'text/csv' })
    const input = await screen.findByLabelText(/Upload bank feed CSV/i)
    await withinAct(async () => { await user.upload(input, file) })
    await flushAsync()

    // Notice should display parsed counts
    await waitFor(() => {
      expect(screen.getByText(/Upload complete: added 3, duplicates 1, skipped 2 of 6/i)).toBeInTheDocument()
    })
  })
})
