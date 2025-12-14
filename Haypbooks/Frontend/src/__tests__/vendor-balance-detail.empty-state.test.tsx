import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import { setupReportPageTest } from './test-utils'

describe('Vendor Balance Detail empty state', () => {
  it('renders caption, headers, empty message, and totals', async () => {
    const { mockFetch, cleanup } = setupReportPageTest()
    try {
      const asOf = '2025-09-15'
      mockFetch.mockResolvedValueOnce({ ok: true, json: async () => ({ period: 'MTD', asOf, rows: [], totals: { amount: 0 } }) })

      const { default: Page } = await import('@/app/reports/vendor-balance-detail/page')
      render(await Page({ searchParams: {} } as any) as any)

      // Caption title
      expect(await screen.findByText('Vendor Balance Detail')).toBeInTheDocument()
      // Caption date line (formatted date)
      expect(screen.getByText('September 15, 2025')).toBeInTheDocument()

      // Header cells
      expect(screen.getByText('Date')).toBeInTheDocument()
      expect(screen.getByText('Type')).toBeInTheDocument()
      expect(screen.getByText('Number')).toBeInTheDocument()
      expect(screen.getByText('Vendor')).toBeInTheDocument()
      expect(screen.getByText('Memo')).toBeInTheDocument()
      expect(screen.getByText('Amount')).toBeInTheDocument()

      // Empty state message
      expect(screen.getByText('No results')).toBeInTheDocument()
      expect(screen.getByText('Try a different date range or clear filters.')).toBeInTheDocument()

  // Totals row: ensure footer total label is present (avoid aria-live text collision)
  const totalCells = screen.getAllByText(/^Total$/)
  expect(totalCells.length).toBeGreaterThan(0)
    } finally {
      cleanup()
    }
  })
})
