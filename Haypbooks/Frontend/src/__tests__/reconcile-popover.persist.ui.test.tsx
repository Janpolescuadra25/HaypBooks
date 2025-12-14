import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { withinAct, flushAsync, interceptActWarnings, restoreActWarningInterception } from '../test-utils/act-helpers'

// Mock next/navigation for in-memory routing
jest.mock('next/navigation', () => {
  let search = 'accountId=acc1&periodEnd=2025-08-31&endingBalance=1000.00'
  let pathname = '/transactions/reconcile'
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

import ReconcilePage from '@/app/transactions/reconcile/page'

describe("Reconcile popover persistence", () => {
  const realFetch = global.fetch
  beforeEach(() => {
    restoreActWarningInterception(); interceptActWarnings({ mode: 'collect' }); localStorage.clear()
    // Minimal fetch stubs to keep workbench stable
    global.fetch = (jest.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = typeof input === 'string' ? input : input.toString()
      const method = (init?.method || 'GET').toUpperCase()
      if (url.startsWith('/api/accounts')) {
        return { ok: true, json: async () => ({ accounts: [{ id: 'acc1', number: '1000', name: 'Checking' }] }) } as any
      }
      if (url.startsWith('/api/reconciliation/sessions') && method === 'GET') {
        return { ok: true, json: async () => ({ sessions: [] }) } as any
      }
      if (url.startsWith('/api/transactions') && method === 'GET') {
        const qs = new URL(url, 'http://localhost').searchParams
        const accountId = qs.get('accountId')
        const rows = accountId ? [] : []
        return { ok: true, json: async () => ({ transactions: rows, total: rows.length, page: 1, limit: 500 }) } as any
      }
      if (url.startsWith('/api/bank-feeds/')) {
        return { ok: true, json: async () => ({ ok: true }) } as any
      }
      return { ok: true, json: async () => ({}) } as any
    }) as any)
  })
  afterEach(() => { global.fetch = realFetch as any })

  it("respects 'Don't show again' on reconciliation help", async () => {
    const user = userEvent.setup()
    render(<ReconcilePage />)
    const helpBtn = await screen.findByRole('button', { name: /show reconciliation checklist/i })
    await withinAct(async () => { await user.click(helpBtn) })
    await flushAsync()
    const dialog = await screen.findByRole('dialog', { name: /reconciliation checklist/i })
    expect(dialog).toBeInTheDocument()
    const checkbox = await screen.findByRole('checkbox', { name: /don’t show again/i })
    await withinAct(async () => { await user.click(checkbox) })
    await flushAsync()
    const close = await screen.findByRole('button', { name: /close/i })
    await withinAct(async () => { await user.click(close) })
    await flushAsync()
    await withinAct(async () => { await user.click(helpBtn) })
    await flushAsync()
    expect(screen.queryByRole('dialog', { name: /reconciliation checklist/i })).not.toBeInTheDocument()
  })
})
