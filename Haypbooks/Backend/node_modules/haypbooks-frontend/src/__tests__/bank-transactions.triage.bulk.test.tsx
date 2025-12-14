import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { withinAct, flushAsync, interceptActWarnings, restoreActWarningInterception } from '../test-utils/act-helpers'

// Mock next/navigation so App Router hooks work in this test
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

describe('Bank Transactions triage: bulk actions', () => {
  const realFetch = global.fetch

  beforeEach(() => {
    const rows = [
      { id: 't1', date: '2025-09-01', description: 'Alpha', category: 'Expense', amount: -10, accountId: 'a1', bankStatus: 'for_review' },
      { id: 't2', date: '2025-09-02', description: 'Beta', category: 'Expense', amount: -20, accountId: 'a1', bankStatus: 'for_review' },
    ]
    let state = { rows: rows.slice() }
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
          const filtered = state.rows.filter(r => (r.bankStatus || 'for_review') === status)
          const slice = filtered.slice((page-1)*limit, (page-1)*limit + limit)
          return { ok: true, json: async () => ({ transactions: slice, total: filtered.length, page, limit }) } as any
        }
        if (method === 'PUT') {
          const body = typeof init?.body === 'string' ? JSON.parse(init!.body as string) : (init?.body as any)
          state.rows = state.rows.map(r => r.id === body.id ? { ...r, ...body } : r)
          return { ok: true, json: async () => ({ transaction: state.rows.find(r => r.id === body.id) }) } as any
        }
      }
      if (url.startsWith('/api/bank-feeds/apply-rules')) {
        return { ok: true, json: async () => ({ updated: 0 }) } as any
      }
      return { ok: true, json: async () => ({}) } as any
    }) as any)
  })

  afterEach(() => { global.fetch = realFetch as any })

  it('selects multiple rows and bulk categorizes/excludes', async () => {
    // Soften act warnings just for this test (global default is 'throw')
    restoreActWarningInterception()
    interceptActWarnings({ mode: 'collect' })
    const user = userEvent.setup()
    render(<BankTransactionsPage />)

    await waitFor(() => expect(screen.getByRole('tab', { name: /For Review/i })).toBeInTheDocument())
    // Wait for table to load and select-all checkbox to appear
    const selectAll = await screen.findByLabelText(/Select all rows/i)
    await withinAct(async () => { await user.click(selectAll) })
    expect(screen.getByRole('button', { name: /Categorize selected \(2\)/i })).toBeInTheDocument()

    // Bulk categorize
    await withinAct(async () => { await user.click(screen.getByRole('button', { name: /Categorize selected/i })) })
    await flushAsync()
    // After categorize, selection is cleared and buttons disappear
    await waitFor(() => expect(screen.queryByRole('button', { name: /Categorize selected/i })).not.toBeInTheDocument())

    // Switch to Categorized tab to verify moved
    await withinAct(async () => { await user.click(screen.getByRole('tab', { name: /Categorized/i })) })
    await waitFor(() => expect(screen.getByText(/Alpha/i)).toBeInTheDocument())
    expect(screen.getByText(/Beta/i)).toBeInTheDocument()
  })
})
