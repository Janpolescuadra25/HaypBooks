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

describe('Bank Transactions: manual match closes on Escape', () => {
  const realFetch = global.fetch

  beforeEach(() => {
    const nav: any = require('next/navigation')
    nav.__setSearch('')
    nav.__setPath('/bank-transactions')
    restoreActWarningInterception(); interceptActWarnings({ mode: 'collect' })

    const rows = [
      { id: 't2', date: '2025-09-03', description: 'Two', category: 'Expense', amount: -30, accountId: 'a1', bankStatus: 'for_review' },
    ]
    let state = { rows: rows.slice() }

    global.fetch = (jest.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = typeof input === 'string' ? input : input.toString()
      const method = (init?.method || 'GET').toUpperCase()
      if (url.startsWith('/api/user/profile')) return { ok: true, json: async () => ({ permissions: ['journal:write'] }) } as any
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
      }
      if (url.startsWith('/api/accounts')) return { ok: true, json: async () => ({ accounts: [{ id: 'a1', number: '6000', name: 'Expense' }] }) } as any
      if (url.startsWith('/api/tags')) return { ok: true, json: async () => ({ tags: [] }) } as any
      return { ok: true, json: async () => ({}) } as any
    }) as any)
  })

  afterEach(() => { global.fetch = realFetch as any })

  it('focuses panel on open and closes with Escape key', async () => {
    const user = userEvent.setup()
    render(<BankTransactionsPage />)

    await waitFor(() => expect(screen.getByRole('tab', { name: /For Review/i })).toBeInTheDocument())
    const desc = await screen.findByText('Two')
    await withinAct(async () => { await user.click(desc) })

    const openManual = await screen.findByRole('button', { name: 'Open manual match panel' })
    await withinAct(async () => { await user.click(openManual) })
    await flushAsync()

    // Region should receive focus and close on Escape
    const region = await screen.findByRole('region', { name: /Manual match/i })
    expect(region).toBeInTheDocument()
    await withinAct(async () => { await user.keyboard('{Escape}') })
    await flushAsync()

    expect(screen.queryByRole('region', { name: /Manual match/i })).not.toBeInTheDocument()
  })
})
