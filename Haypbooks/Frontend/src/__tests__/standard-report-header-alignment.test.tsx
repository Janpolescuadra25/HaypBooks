import '@testing-library/jest-dom'

// Mock Next-linked components/hooks to avoid router/context issues in SSR test
jest.mock('@/lib/server-url', () => ({ getBaseUrl: () => 'http://localhost' }))
jest.mock('@/components/ReportsNav', () => () => null)
jest.mock('@/components/ReportHeader', () => ({ ReportHeader: () => null }))
jest.mock('@/components/StandardReportFilters', () => () => null)
jest.mock('@/components/ActiveFilterBar', () => () => null)

describe('Standard report header alignment', () => {
  it('right-aligns numeric columns and left-aligns text columns in headers', async () => {
    // Mock fetch to return a standard report payload with mixed columns
    const rows = [
      ['Acme Co', 10, 1250.5, '2025-09-10'],
      ['Bravo LLC', 5, 250.0, '2025-09-11'],
    ]
    const payload = {
      period: 'Custom',
      columns: ['Customer', 'Qty', 'Amount', 'Date'],
      rows,
    }

    const fetchSpy = jest.spyOn(global, 'fetch' as any).mockResolvedValueOnce({ ok: true, json: async () => payload })

    const mod = await import('@/app/reports/standard/[slug]/page')
    // Render as a function to get JSX
    const el = await (mod as any).default({ params: { slug: 'sample' }, searchParams: {} })

    const html = typeof el === 'string' ? el : require('react-dom/server').renderToStaticMarkup(el)

    // Numeric headers should include tabular-nums and not text-left
    expect(html).toMatch(/<th[^>]*tabular-nums[^>]*>Qty<\/th>/)
    expect(html).toMatch(/<th[^>]*tabular-nums[^>]*>Amount<\/th>/)
    expect(html).not.toMatch(/<th[^>]*text-left[^>]*>Qty<\/th>/)
    expect(html).not.toMatch(/<th[^>]*text-left[^>]*>Amount<\/th>/)
    // Text headers should include text-left
    expect(html).toMatch(/<th[^>]*text-left[^>]*>Customer<\/th>/)
    expect(html).toMatch(/<th[^>]*text-left[^>]*>Date<\/th>/)

    fetchSpy.mockRestore()
  })
})
