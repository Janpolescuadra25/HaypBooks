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

describe('Bank Transactions: per-row Match flow', () => {
  const realFetch = global.fetch

  beforeEach(() => {
    // Reset mocked router state between tests to avoid leaking search/path
    const nav: any = require('next/navigation')
    nav.__setSearch('')
    nav.__setPath('/bank-transactions')
    // Reduce act warnings in these UI tests
    restoreActWarningInterception(); interceptActWarnings({ mode: 'collect' })
    const rows = [
      { id: 't0', date: '2025-09-01', description: 'Zero', category: 'Expense', amount: -10, accountId: 'a1', bankStatus: 'for_review' },
      { id: 't1', date: '2025-09-02', description: 'One', category: 'Expense', amount: -20, accountId: 'a1', bankStatus: 'for_review' },
      { id: 't2', date: '2025-09-03', description: 'Two', category: 'Expense', amount: -30, accountId: 'a1', bankStatus: 'for_review' },
    ]
    const suggestions: Record<string, any[]> = {
      t0: [],
      // Negative amounts are withdrawals → bills in one-sided policy
      t1: [{ kind: 'bill', id: 'b-1', number: 'BILL-1', name: 'Alice Co', date: '2025-09-05', balance: 20 }],
      t2: [
        { kind: 'bill', id: 'b-21', number: 'BILL-21', name: 'Bob LLC', date: '2025-09-06', balance: 30 },
        { kind: 'bill', id: 'b-22', number: 'BILL-22', name: 'Bob LLC', date: '2025-09-07', balance: 30 },
      ],
    }
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
          let filtered = state.rows.filter(r => (r.bankStatus || 'for_review') === status)
          // For for_review, also include any 'imported' status
          if (status === 'for_review') filtered = state.rows.filter(r => (r.bankStatus || 'for_review') === 'for_review' || r.bankStatus === 'imported')
          const slice = filtered.slice((page-1)*limit, (page-1)*limit + limit)
          return { ok: true, json: async () => ({ transactions: slice, total: filtered.length, page, limit }) } as any
        }
        if (method === 'PUT') {
          const body = typeof init?.body === 'string' ? JSON.parse(init!.body as string) : (init?.body as any)
          state.rows = state.rows.map(r => r.id === body.id ? { ...r, ...body } : r)
          return { ok: true, json: async () => ({ transaction: state.rows.find(r => r.id === body.id) }) } as any
        }
      }
      if (url.startsWith('/api/bank-feeds/match-suggestions')) {
        const u = new URL(url, 'http://localhost')
        const txnId = u.searchParams.get('txnId') || ''
        return { ok: true, json: async () => ({ result: { candidates: suggestions[txnId] || [] } }) } as any
      }
      if (url.startsWith('/api/bank-feeds/apply-match')) {
        // Apply match marks txn categorized server-side
        const body = typeof init?.body === 'string' ? JSON.parse(init!.body as string) : (init?.body as any)
        const { txnId } = body || {}
        state.rows = state.rows.map(r => r.id === txnId ? { ...r, bankStatus: 'categorized', matchedKind: 'invoice', matchedId: 'iX', matchedRef: 'INV-X' } : r)
        return { ok: true, json: async () => ({ ok: true }) } as any
      }
      if (url.startsWith('/api/bank-feeds/unmatch')) {
        const body = typeof init?.body === 'string' ? JSON.parse(init!.body as string) : (init?.body as any)
        const { txnId } = body || {}
        state.rows = state.rows.map(r => r.id === txnId ? { ...r, bankStatus: 'for_review', matchedKind: undefined, matchedId: undefined, matchedRef: undefined } : r)
        return { ok: true, json: async () => ({ ok: true }) } as any
      }
      if (url.startsWith('/api/accounts')) {
        return { ok: true, json: async () => ({ accounts: [{ id: 'a1', number: '6000', name: 'Expense' }] }) } as any
      }
      if (url.startsWith('/api/tags')) {
        return { ok: true, json: async () => ({ tags: [] }) } as any
      }
      if (url.startsWith('/api/bank-feeds/apply-rules')) {
        return { ok: true, json: async () => ({ updated: 0 }) } as any
      }
      return { ok: true, json: async () => ({}) } as any
    }) as any)
  })

  afterEach(() => { global.fetch = realFetch as any })

  it('auto-scans and shows Matches badges for each row', async () => {
    const user = userEvent.setup()
    render(<BankTransactionsPage />)
    await waitFor(() => expect(screen.getByRole('tab', { name: /For Review/i })).toBeInTheDocument())

    // The auto-scan effect should fetch suggestions and render badges
    await waitFor(() => {
      expect(screen.getAllByText(/Matches ×/i).length).toBeGreaterThanOrEqual(2)
    })
    expect(screen.getByText('Matches ×0')).toBeInTheDocument()
    expect(screen.getByText('Matches ×1')).toBeInTheDocument()
    expect(screen.getByText('Matches ×2')).toBeInTheDocument()
  })

  it('0 suggestions: no per-row button, expanded Match suggestions works and shows no results', async () => {
    const user = userEvent.setup()
    render(<BankTransactionsPage />)
    await waitFor(() => expect(screen.getByRole('tab', { name: /For Review/i })).toBeInTheDocument())

    // No per-row button when count is 0
    expect(screen.queryByRole('button', { name: /Apply match for Zero/i })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /Open match suggestions for Zero/i })).not.toBeInTheDocument()

  // Expand the row by clicking on the description cell text
  const zeroCell = await screen.findByText('Zero')
  await withinAct(async () => { await user.click(zeroCell) })
  const openSuggestions = await screen.findByRole('button', { name: 'Open match suggestions' })
    await withinAct(async () => { await user.click(openSuggestions) })
    await flushAsync()

    // No notice needed; we simply show the suggestions panel with empty state
    // Suggestions panel shows a "No close matches found" message for the expanded row
    await waitFor(() => expect(screen.getByText(/No close matches found/i)).toBeInTheDocument())
  })

  it('1 suggestion: shows per-row Match and applies automatically, then moves to Categorized with notice', async () => {
    const user = userEvent.setup()
    render(<BankTransactionsPage />)
    await waitFor(() => expect(screen.getByRole('tab', { name: /For Review/i })).toBeInTheDocument())

    const btn = await screen.findByRole('button', { name: /Apply match for One/i })
    await withinAct(async () => { await user.click(btn) })
    await flushAsync()

    // Notice
    await waitFor(() => expect(screen.getByText(/Match applied/i)).toBeInTheDocument())
    // Page should navigate to Categorized tab view (implicit via bankStatus replacement)
    await waitFor(() => expect(screen.getByRole('tab', { name: /Categorized/i })).toBeInTheDocument())
  })

  it('many suggestions: shows per-row Suggested match; opens inline suggestions and applying one categorizes and shows notice', async () => {
    const user = userEvent.setup()
    render(<BankTransactionsPage />)
    await waitFor(() => expect(screen.getByRole('tab', { name: /For Review/i })).toBeInTheDocument())

  // The per-row button renders visible text "Suggested match" but its accessible name
  // is provided by aria-label: "Open match suggestions for <description>".
  // Target it by its accessible name to avoid ambiguity across rows.
  const btn = await screen.findByRole('button', { name: /Open match suggestions for Two/i })
    await withinAct(async () => { await user.click(btn) })
    await flushAsync()

  // Inline suggestions panel opens (expanded) — wait for actionable suggestion buttons
  await waitFor(() => expect(screen.getAllByRole('button', { name: /Apply match to/i }).length).toBeGreaterThan(0))
  const applyButtons = screen.getAllByRole('button', { name: /Apply match to/i })
    await withinAct(async () => { await user.click(applyButtons[0]) })
    await flushAsync()

    await waitFor(() => expect(screen.getByText(/Match applied/i)).toBeInTheDocument())
  })
})
