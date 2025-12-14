import '@testing-library/jest-dom'

// Mock Next-linked components/hooks to avoid router/context issues in SSR test
jest.mock('@/lib/server-url', () => ({ getBaseUrl: () => 'http://localhost' }))
jest.mock('@/components/ReportsNav', () => () => null)
jest.mock('@/components/ReportHeader', () => ({ ReportHeader: () => null }))
jest.mock('@/components/StandardReportFilters', () => () => null)
jest.mock('@/components/ActiveFilterBar', () => () => null)

describe('Standard report date formatting', () => {
  it('renders Date column cells as MM/DD/YYYY regardless of input shape', async () => {
    // Provide mixed date input formats
    const rows = [
      ['Alpha', 10, 100, '2025-09-10'], // yyyy-mm-dd
      ['Beta', 5, 50, '2025-09-11T00:00:00.000Z'], // ISO
      ['Gamma', 7, 70, new Date(Date.UTC(2025, 8, 12))], // Date object (UTC Sep 12, 2025)
      ['Delta', 3, 30, '09/13/2025'], // already mm/dd/yyyy
    ]
    const payload = {
      period: 'Custom',
      columns: ['Name', 'Qty', 'Amount', 'Date'],
      rows,
    }

    const fetchSpy = jest
      .spyOn(global, 'fetch' as any)
      .mockResolvedValueOnce({ ok: true, json: async () => payload })

    const mod = await import('@/app/reports/standard/[slug]/page')
    const el = await (mod as any).default({ params: { slug: 'sample' }, searchParams: {} })

    const html = typeof el === 'string' ? el : require('react-dom/server').renderToStaticMarkup(el)

    // Expect four mm/dd/yyyy dates present
    expect(html).toMatch(/09\/10\/2025/)
    expect(html).toMatch(/09\/11\/2025/)
    expect(html).toMatch(/09\/12\/2025/)
    expect(html).toMatch(/09\/13\/2025/)

    // Should not render long month names inside table body for Date column
    expect(html).not.toMatch(/September\s+1[0-3],\s+2025/)

    fetchSpy.mockRestore()
  })
})
