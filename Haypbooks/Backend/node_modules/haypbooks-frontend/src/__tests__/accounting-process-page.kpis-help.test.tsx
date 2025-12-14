import { render, screen, fireEvent } from '@testing-library/react'

jest.mock('next/link', () => ({ __esModule: true, default: ({ children }: any) => children }))

describe('Accounting process page KPI tooltips and links', () => {
  test('renders DSO/DPO help and additional bucket links', async () => {
    const mockSummary = {
      asOf: '2025-01-31',
      period: { start: '2025-01-01', end: '2025-01-31' },
      ar: { customers: 3, openInvoices: 5, openBalance: 1000, overdueBalance: 200, unappliedCredits: 50, nextDueDate: '2025-02-15' },
      receipts: { undeposited: { count: 2, total: 300 }, deposits: { last30: { count: 1, total: 500 }, totalCount: 1 } },
      ap: { vendors: 4, openBills: 6, openBalance: 800, overdueBalance: 100, creditsAvailable: 25, nextDueDate: '2025-02-10' },
      gl: { trialBalanceBalanced: true, accounts: 10, journalEntries: 20 },
      kpis: { dsoDays: 15.2, dpoDays: 12.8 },
      settings: { accountingMethod: 'accrual', closeDate: null, allowBackdated: true },
    }
    const g = global as any
    const origFetch = g.fetch
    g.fetch = jest.fn(async () => ({ ok: true, json: async () => mockSummary }))

    const Page = (await import('@/app/accounting/process/page')).default as any
    render(<Page />)

    // Wait for header
    expect(await screen.findByText(/Accounting process/i)).toBeInTheDocument()

  // DSO/DPO labels appear
  expect(await screen.findByText('DSO')).toBeInTheDocument()
  expect(await screen.findByText('DPO')).toBeInTheDocument()

    // Open DSO popover by clicking help button
  const dsoHelpBtn = (await screen.findAllByRole('button', { name: /what is dso\?/i }))[0]
    fireEvent.click(dsoHelpBtn)
    expect(await screen.findByRole('dialog', { name: /dso help/i })).toBeInTheDocument()

    // Ensure bucket quick links exist
  expect((await screen.findAllByText(/60\+/)).length).toBeGreaterThanOrEqual(1)
  expect((await screen.findAllByText(/90\+/)).length).toBeGreaterThanOrEqual(1)
  expect((await screen.findAllByText(/120\+/)).length).toBeGreaterThanOrEqual(1)

    g.fetch = origFetch
  })
})
