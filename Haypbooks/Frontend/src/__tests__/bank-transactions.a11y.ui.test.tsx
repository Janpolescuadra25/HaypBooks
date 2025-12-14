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

describe('Bank Transactions: accessibility of per-row controls', () => {
  const realFetch = global.fetch

  beforeEach(() => {
    const nav: any = require('next/navigation')
    nav.__setSearch('')
    nav.__setPath('/bank-transactions')
    restoreActWarningInterception(); interceptActWarnings({ mode: 'collect' })

    const rows = [
      { id: 't1', date: '2025-09-02', description: 'One', category: 'Expense', amount: -20, accountId: 'a1', bankStatus: 'for_review' },
      { id: 't2', date: '2025-09-03', description: 'Two', category: 'Expense', amount: -30, accountId: 'a1', bankStatus: 'for_review' },
    ]
    const suggestions: Record<string, any[]> = {
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
        const body = typeof init?.body === 'string' ? JSON.parse(init!.body as string) : (init?.body as any)
        const { txnId } = body || {}
        state.rows = state.rows.map(r => r.id === txnId ? { ...r, bankStatus: 'categorized', matchedKind: 'bill', matchedId: 'bX', matchedRef: 'BILL-X' } : r)
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

  it('exposes unique accessible names per row and actionable suggestion buttons', async () => {
    const user = userEvent.setup()
    render(<BankTransactionsPage />)
    await waitFor(() => expect(screen.getByRole('tab', { name: /For Review/i })).toBeInTheDocument())

  // Per-row accessible names should be unique and reflect the flow:
  // - 1 suggestion → direct apply button
  // - many suggestions → open suggestions button
  const oneBtn = await screen.findByRole('button', { name: /Apply match for One/i })
  const twoBtn = await screen.findByRole('button', { name: /Open match suggestions for Two/i })
  expect(oneBtn).toBeInTheDocument()
  expect(twoBtn).toBeInTheDocument()

    // Open suggestions for Two and ensure actionable buttons render
    await withinAct(async () => { await user.click(twoBtn) })
    await flushAsync()

    const applyButtons = await screen.findAllByRole('button', { name: /Apply match to/i })
    expect(applyButtons.length).toBeGreaterThan(0)
  })
})
