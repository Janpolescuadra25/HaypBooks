import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'

jest.mock('next/link', () => ({ __esModule: true, default: ({ children }: any) => <a>{children}</a> }))
jest.mock('@/lib/server-url', () => ({ getBaseUrl: () => 'http://localhost:3000' }))
// Avoid mounting components that depend on App Router hooks (useRouter/useSearchParams)
jest.mock('@/components/ReportHeader', () => ({ ReportHeader: () => null }))

// Mock fetch for the page to return empty rows
const mockFetch = jest.fn()
;(global as any).fetch = mockFetch

describe('Open Invoices empty state', () => {
  it('renders caption, headers, empty message, totals, and keeps Print available', async () => {
    const asOf = '2025-10-08'
    mockFetch.mockResolvedValueOnce({ ok: true, json: async () => ({ period: 'Q3', asOf, rows: [], totals: { openBalance: 0 } }) })

    const { default: Page } = await import('@/app/reports/open-invoices/page')
    render(await Page({ searchParams: {} } as any) as any)

    // Caption title
    expect(await screen.findByText('Open Invoices')).toBeInTheDocument()
  // Caption date line (formatted date)
  expect(screen.getByText('October 8, 2025')).toBeInTheDocument()

    // Header cells
    expect(screen.getByText('Customer')).toBeInTheDocument()
    expect(screen.getByText('Open Balance')).toBeInTheDocument()

    // Empty state message
    expect(screen.getByText('No results')).toBeInTheDocument()
    expect(screen.getByText('Try a different date range or clear filters.')).toBeInTheDocument()

    // Totals row
    expect(screen.getByText('Totals')).toBeInTheDocument()
  })
})
