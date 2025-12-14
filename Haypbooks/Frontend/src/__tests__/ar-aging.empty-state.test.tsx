import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import { setupReportPageTest } from './test-utils'

describe('A/R Aging empty state', () => {
  it('renders caption, headers, empty message, and totals', async () => {
    const { mockFetch, cleanup } = setupReportPageTest()
    try {
      const asOf = '2025-10-08'
      mockFetch.mockResolvedValueOnce({ ok: true, json: async () => ({ period: 'MTD', asOf, rows: [], totals: { current: 0, 30: 0, 60: 0, 90: 0, '120+': 0, total: 0 } }) })

      const { default: Page } = await import('@/app/reports/ar-aging/page')
      render(await Page({ searchParams: {} } as any) as any)

      // Caption title and date
      expect(await screen.findByText('A/R Aging')).toBeInTheDocument()
      expect(screen.getByText('October 8, 2025')).toBeInTheDocument()

      // Headers
      expect(screen.getByText('Customer')).toBeInTheDocument()
      expect(screen.getByText('Total')).toBeInTheDocument()

      // Empty message
      expect(screen.getByText('No results')).toBeInTheDocument()
      expect(screen.getByText('Try a different date range or clear filters.')).toBeInTheDocument()

      // Totals row footer
      expect(screen.getByText('Totals')).toBeInTheDocument()
    } finally {
      cleanup()
    }
  })
})
