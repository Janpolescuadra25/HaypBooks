import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { withinAct, flushAsync, interceptActWarnings, restoreActWarningInterception } from '../test-utils/act-helpers'

// Mock next/navigation
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

describe('Bank Transactions: transfer counterpart matching', () => {
  const realFetch = global.fetch

  beforeEach(() => {
    const nav: any = require('next/navigation')
    nav.__setSearch('')
    nav.__setPath('/bank-transactions')
    restoreActWarningInterception(); interceptActWarnings({ mode: 'collect' })

    const rows = [
      { id: 't-bank', date: '2025-01-12', description: 'Transfer to Savings', category: 'Transfer', amount: -200, accountId: 'a1', bankStatus: 'for_review' },
    ]
    let state = { rows: rows.slice() }

    global.fetch = (jest.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = typeof input === 'string' ? input : input.toString()
      const method = (init?.method || 'GET').toUpperCase()
      if (url.startsWith('/api/user/profile')) return { ok: true, json: async () => ({ permissions: ['journal:write','reports:read'] }) } as any
      if (url.startsWith('/api/accounts')) return { ok: true, json: async () => ({ accounts: [ { id: 'a1', number: '1000', name: 'Checking' }, { id: 'a2', number: '1002', name: 'Savings' } ] }) } as any
      if (url.startsWith('/api/transactions')) {
        if (method === 'GET') {
          const u = new URL(url, 'http://localhost')
          const status = u.searchParams.get('bankStatus') || 'for_review'
          const page = Number(u.searchParams.get('page') || '1')
          const limit = Number(u.searchParams.get('limit') || '20')
          let filtered = state.rows.filter(r => (r.bankStatus || 'for_review') === status)
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
        // Return a BankTransfer candidate compatible with Checking (1000) → Savings (1002)
        return { ok: true, json: async () => ({ result: { candidates: [ { kind: 'transfer', id: 'xfer-1', number: 'xfer-1', name: 'Transfer 1000 → 1002', date: '2025-01-12', balance: 200, score: 0.0 } ] } }) } as any
      }
      if (url.startsWith('/api/bank-feeds/apply-match')) {
        const body = typeof init?.body === 'string' ? JSON.parse(init!.body as string) : (init?.body as any)
        const { txnId, kind } = body || {}
        if (kind !== 'transfer') return { ok: false, json: async () => ({ error: 'Expected transfer' }) } as any
        state.rows = state.rows.map(r => r.id === txnId ? { ...r, bankStatus: 'categorized', matchedKind: 'transfer', matchedId: 'xfer-1', matchedRef: '1000→1002' } : r)
        return { ok: true, json: async () => ({ ok: true }) } as any
      }
      if (url.startsWith('/api/tags')) return { ok: true, json: async () => ({ tags: [] }) } as any
      return { ok: true, json: async () => ({}) } as any
    }) as any)
  })

  afterEach(() => { global.fetch = realFetch as any })

  it('shows Suggested match for Transfer rows and links transfer', async () => {
    const user = userEvent.setup()
    render(<BankTransactionsPage />)
    await waitFor(() => expect(screen.getByRole('tab', { name: /For Review/i })).toBeInTheDocument())

    // With a single suggestion, a direct Match button should appear
    const matchBtn = await screen.findByRole('button', { name: /Apply match for/i })
    await withinAct(async () => { await user.click(matchBtn) })
    await flushAsync()

    await waitFor(() => expect(screen.getByText(/Match applied/i)).toBeInTheDocument())
  })
})
