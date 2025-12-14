import React from 'react'
import { render, screen, waitFor, within } from '@testing-library/react'
import { act } from 'react'
import userEvent from '@testing-library/user-event'
import ReconcileWorkbench from '@/components/ReconcileWorkbench'

// Mock next/navigation for in-memory routing context
jest.mock('next/navigation', () => {
  let search = 'accountId=acc_1000&periodEnd=2025-01-31&endingBalance=0'
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

describe('ReconcileWorkbench finish + export flow', () => {
  const realFetch = global.fetch
  const realCreateObj = URL.createObjectURL
  const realAlert = global.alert
  const realAnchorClick = (window as any).HTMLAnchorElement.prototype.click

  beforeEach(() => {
    // Mock URL and alert side-effects
    ;(URL as any).createObjectURL = jest.fn(() => 'blob:mock')
    // @ts-ignore
    global.alert = jest.fn()
    // Prevent jsdom navigation when clicking the download link
    ;(window as any).HTMLAnchorElement.prototype.click = jest.fn()
  })

  afterEach(() => {
    global.fetch = realFetch as any
    ;(URL as any).createObjectURL = realCreateObj
    // @ts-ignore
    global.alert = realAlert
    ;(window as any).HTMLAnchorElement.prototype.click = realAnchorClick
  })

  it('submits session and allows export when balanced', async () => {
    // Arrange: mock accounts, transactions, and sessions POST
    const user = userEvent.setup()
    global.fetch = (jest.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = typeof input === 'string' ? input : input.toString()
      if (url.startsWith('/api/accounts')) {
        return { ok: true, json: async () => ({ accounts: [ { id: 'acc_1000', number: '1000', name: 'Cash' } ] }) } as any
      }
      if (url.startsWith('/api/transactions?')) {
        return { ok: true, json: async () => ({ transactions: [
          { id: 't1', date: '2025-01-05T00:00:00.000Z', description: 'Deposit', amount: 100, accountId: 'acc_1000' },
          { id: 't2', date: '2025-01-06T00:00:00.000Z', description: 'Withdrawal', amount: -30, accountId: 'acc_1000' },
        ] }) } as any
      }
      if (url.startsWith('/api/reconciliation/sessions') && init?.method === 'POST') {
        return { ok: true, status: 201, json: async () => ({ session: { id: 'rec_1' } }) } as any
      }
      if (url.startsWith('/api/reconciliation/sessions/rec_1/export')) {
        const headers = new Headers({ 'Content-Disposition': 'attachment; filename="reconciliation-acc-1000-2025-01-31.csv"' })
        return {
          ok: true,
          headers,
          blob: async () => new Blob([
            'CSV-Version,1\n',
            'Reconciliation Report for 1000 Cash as of 2025-01-31\n',
            '\n',
            'Date,Memo,Debit,Credit,Balance\n',
            '...\n',
          ], { type: 'text/csv' }),
        } as any
      }
      if (url.startsWith('/api/bank-feeds/')) {
        return { ok: true, json: async () => ({ ok: true }) } as any
      }
      return { ok: true, json: async () => ({}) } as any
    }) as any)

    render(<ReconcileWorkbench />)

    // Wait for summary and transactions to load (setup bar was removed)
    await screen.findByLabelText(/Reconciliation summary/i)
    await screen.findByLabelText(/Reconcile transactions/i)

    // Expect Difference to be 0 and Finish button enabled (now in summary area)
    const summary = await screen.findByLabelText(/Reconciliation summary/i)
    await waitFor(() => {
      expect(within(summary).getByText(/Difference/i).parentElement?.textContent).toMatch(/\$0\.00|0\.00/)
    })
    const finishBtn = within(summary).getByRole('button', { name: /Finish reconciliation/i })
    await waitFor(() => {
      expect(finishBtn).toBeEnabled()
    })

    await act(async () => {
      await user.click(finishBtn)
    })

    // After finishing, export button should be enabled and clicking it downloads
    const exportBtn = within(summary).getByRole('button', { name: /Export reconciliation report/i })
    await waitFor(() => {
      expect(exportBtn).toBeEnabled()
    })
    await act(async () => {
      await user.click(exportBtn)
    })

    // Assert POST called and download initiated
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        '/api/reconciliation/sessions',
        expect.objectContaining({ method: 'POST' })
      )
      expect(URL.createObjectURL).toHaveBeenCalled()
      // Notice is surfaced via query param; no alert expected
    })
  })
})
