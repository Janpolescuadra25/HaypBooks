import '@testing-library/jest-dom'
import { render, screen, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import React from 'react'

jest.mock('next/navigation', () => ({ useRouter: () => ({ push: jest.fn(), back: jest.fn() }) }))
jest.mock('@/lib/server-url', () => ({ getBaseUrl: () => 'http://localhost' }))
jest.mock('@/components/ReportPeriodSelect', () => ({ ReportPeriodSelect: () => null }))
jest.mock('@/components/ReportActions', () => ({
  ExportCsvButton: () => null,
  PrintButton: () => null,
  RefreshButton: () => null,
}))

// Mock fetch for the TLS page
const rows = [
  { txnId: 'T-100', date: '2025-09-05', type: 'Journal', number: 'J100', payee: 'N/A', memo: 'Header line', splitAccount: '1000 Checking', debit: 100, credit: 0 },
  { txnId: 'T-100', date: '2025-09-05', type: 'Journal', number: 'J100', payee: 'N/A', memo: 'Split line', splitAccount: '2000 AP', debit: 0, credit: 100 },
  { txnId: 'T-101', date: '2025-09-06', type: 'Expense', number: 'E101', payee: 'Vendor', memo: 'Single line', splitAccount: '6000 Supplies', debit: 25, credit: 0 },
]
const payload = {
  period: 'YTD',
  asOf: '2025-09-06',
  totals: { debit: 125, credit: 100 },
  rows,
}

describe('Transaction List with Splits UX/a11y', () => {
  beforeEach(() => {
    jest.spyOn(global, 'fetch' as any).mockResolvedValueOnce({ ok: true, json: async () => payload })
  })

  it('renders sticky header and aria-live totals and expands/collapses splits', async () => {
    const mod = await import('@/app/reports/transaction-list-with-splits/page')
    const el = await (mod as any).default({ searchParams: {} })
    const html = typeof el === 'string' ? el : require('react-dom/server').renderToStaticMarkup(el)

    // Sticky header class present
    expect(html).toMatch(/<thead[^>]*sticky/)

    // Render into DOM to interact (client component in tbody)
    const ui = render(el as any)

    // aria-live region should exist
    expect(await screen.findByText(/Totals updated\./i)).toBeInTheDocument()

    // Find first group button "Show splits"
    const btn = await screen.findByRole('button', { name: /show splits/i })
    expect(btn).toBeInTheDocument()

    // Initially split row should be hidden
    const rowsEls = await screen.findAllByRole('row')
    // There will be header row + group rows; ensure at least one hidden split exists in DOM
    const hidden = ui.container.querySelector('[data-split-row].hidden')
    expect(hidden).toBeTruthy()

    const user = userEvent.setup()
    await act(async () => {
      await user.click(btn)
    })

    // After expand, split row should be visible
    const nowVisible = ui.container.querySelector('[data-split-row].hidden')
    expect(nowVisible).toBeFalsy()
  })
})
