import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import { setupReportPageTest } from './test-utils'

describe('Vendor Balance Summary empty state', () => {
  it('renders caption, headers, empty message, and totals', async () => {
    const { mockFetch, cleanup } = setupReportPageTest()
    try {
      const asOf = '2025-10-08'
      mockFetch.mockResolvedValueOnce({ ok: true, json: async () => ({ period: 'MTD', asOf, rows: [], totals: { openBalance: 0 } }) })

      const { default: Page } = await import('@/app/reports/vendor-balance-summary/page')
      render(await Page({ searchParams: {} } as any) as any)

      // Caption title
      expect(await screen.findByText('Vendor Balance Summary')).toBeInTheDocument()
      // Caption date line (formatted date)
      expect(screen.getByText('October 8, 2025')).toBeInTheDocument()

      // Header cells
      expect(screen.getByText('Vendor')).toBeInTheDocument()
      expect(screen.getByText('Open Balance')).toBeInTheDocument()

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
