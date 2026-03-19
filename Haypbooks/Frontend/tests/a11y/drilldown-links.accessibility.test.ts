import React from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

// Mock non-essential client components to avoid complexity in tests
jest.mock('@/components/ReportPeriodSelect', () => ({ ReportPeriodSelect: () => React.createElement('div') }))
jest.mock('@/components/ReportActions', () => ({ ExportCsvButton: () => React.createElement('div'), PrintButton: () => React.createElement('div'), RefreshButton: () => React.createElement('div') }))
jest.mock('@/components/BackButton', () => ({ BackButton: () => React.createElement('div') }))

// Ensure base URL is empty string so fetch uses relative path
jest.mock('@/lib/server-url', () => ({ getBaseUrl: () => '' }))

describe('Drilldown link accessibility', () => {
  beforeEach(() => {
    // @ts-ignore override global fetch for each test
    global.fetch = jest.fn(async (url: string) => {
      // Shape responses based on the path requested
      if (url.startsWith('/api/reports/balance-sheet')) {
        // Minimal mock payload expected by the Balance Sheet page
        return new Response(
          JSON.stringify({
            period: 'YTD',
            asOf: '2025-01-31',
            assets: [
              { name: 'Cash', amount: 12000 },
              { name: 'Accounts Receivable', amount: 8000 },
              { name: 'Inventory', amount: 5000 },
            ],
            liabilities: [
              { name: 'Accounts Payable', amount: -6000 },
              { name: 'Credit Card', amount: -2000 },
            ],
            equity: [
              { name: 'Owner’s Equity', amount: 1000 },
              { name: 'Retained Earnings', amount: 21000 },
            ],
            totals: { assets: 25000, liabilities: -8000, equity: 22000 },
            balanced: true,
          }),
          { status: 200, headers: { 'Content-Type': 'application/json' } }
        )
      }
      if (url.startsWith('/api/reports/profit-loss')) {
        return new Response(
          JSON.stringify({
            period: 'YTD',
            lines: [
              { name: 'Revenue', amount: 50000 },
              { name: 'Operating Expenses', amount: -30000 },
            ],
          }),
          { status: 200, headers: { 'Content-Type': 'application/json' } }
        )
      }
      return new Response('Not Found', { status: 404 })
    }) as any
  })

  test('Balance Sheet: account and totals rows are keyboard-focusable links with correct href', async () => {
    const { default: BalanceSheetPage } = await import('@/app/reports/balance-sheet/page')
    const element = await BalanceSheetPage()
    render(element as any)

    // Account line link: Cash → account 1000
    const cashLink = await screen.findByRole('link', { name: 'Cash' })
    expect(cashLink).toBeInTheDocument()
    expect(cashLink).toHaveAttribute('href', expect.stringContaining('/reports/transaction-detail-by-account'))
    expect(cashLink).toHaveAttribute('href', expect.stringContaining('account=1000'))

    // Totals link aggregates all mapped asset accounts
    const totalAssetsLink = await screen.findByRole('link', { name: /Total Assets/i })
    expect(totalAssetsLink).toBeInTheDocument()
    const href = (totalAssetsLink as HTMLAnchorElement).getAttribute('href') || ''
    expect(href).toContain('account=1000') // Cash
    expect(href).toContain('account=1010') // Accounts Receivable
    expect(href).toContain('account=1100') // Inventory

    // Keyboard navigation can focus links
    await userEvent.tab()
    // We don't know exact tab order due to mocked header, but ensure links are tabbable
    // So manually focus and assert focusability
    ;(cashLink as HTMLAnchorElement).focus()
    expect(cashLink).toHaveFocus()
    ;(totalAssetsLink as HTMLAnchorElement).focus()
    expect(totalAssetsLink).toHaveFocus()
  })

  test('Profit & Loss: section rows are links with preserved filters', async () => {
    const { default: ProfitLossPage } = await import('@/app/reports/profit-loss/page')
    const element = await ProfitLossPage()
    render(element as any)

    const revLink = await screen.findByRole('link', { name: 'Revenue' })
    expect(revLink).toBeInTheDocument()
    const revHref = (revLink as HTMLAnchorElement).getAttribute('href') || ''
    expect(revHref).toContain('/reports/transaction-detail-by-account')
    expect(revHref).toContain('account=4000')
    expect(revHref).toContain('start=2025-01-01')
    expect(revHref).toContain('end=2025-01-31')

    const opexLink = await screen.findByRole('link', { name: 'Operating Expenses' })
    const opexHref = (opexLink as HTMLAnchorElement).getAttribute('href') || ''
    expect(opexHref).toContain('account=5000')
  })
})
