import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import { setupReportPageTest } from './test-utils'

describe('Unpaid Bills empty state', () => {
  it('renders caption, headers, empty message, and totals', async () => {
    const { mockFetch, cleanup } = setupReportPageTest()
    try {
      const asOf = '2025-10-08'
      mockFetch.mockResolvedValueOnce({ ok: true, json: async () => ({ period: 'MTD', asOf, rows: [], totals: { amountDue: 0 } }) })

      const { default: Page } = await import('@/app/reports/unpaid-bills/page')
      render(await Page({ searchParams: {} } as any) as any)

      // Caption title
      expect(await screen.findByText('Unpaid Bills')).toBeInTheDocument()
      // Caption date line (formatted date)
      expect(screen.getByText('October 8, 2025')).toBeInTheDocument()

      // Header cells
      expect(screen.getByText('Vendor')).toBeInTheDocument()
      expect(screen.getByText('Amount Due')).toBeInTheDocument()

      // Empty state message
      expect(screen.getByText('No results')).toBeInTheDocument()
      expect(screen.getByText('Try a different date range or clear filters.')).toBeInTheDocument()

      // Totals row
      expect(screen.getByText('Totals')).toBeInTheDocument()
    } finally {
      cleanup()
    }
  })
})
