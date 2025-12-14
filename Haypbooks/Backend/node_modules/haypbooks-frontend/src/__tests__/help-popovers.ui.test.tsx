import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { withinAct, flushAsync, interceptActWarnings, restoreActWarningInterception } from '../test-utils/act-helpers'

// Mock next/navigation to keep URL state in-memory (avoids Next.js app router invariant)
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
import ReconcileWorkbench from '@/components/ReconcileWorkbench'

// Minimal smoke tests to verify the help popovers render above the UI and contain expected headings

describe('Help popovers', () => {
  beforeEach(() => { restoreActWarningInterception(); interceptActWarnings({ mode: 'collect' }) })

  it('shows Bank review strategy popover content', async () => {
    render(<BankTransactionsPage />)
    const user = userEvent.setup()
    const helpBtn = await screen.findByRole('button', { name: /show bank review strategy/i })
    await withinAct(async () => { await user.click(helpBtn) })
    await flushAsync()
    expect(await screen.findByRole('dialog', { name: /bank review strategy/i })).toBeInTheDocument()
  })

  it('shows Reconciliation checklist popover content', async () => {
    render(<ReconcileWorkbench />)
    const user = userEvent.setup()
    const helpBtn = await screen.findByRole('button', { name: /show reconciliation checklist/i })
    await withinAct(async () => { await user.click(helpBtn) })
    await flushAsync()
    expect(await screen.findByRole('dialog', { name: /reconciliation checklist/i })).toBeInTheDocument()
  })
})
