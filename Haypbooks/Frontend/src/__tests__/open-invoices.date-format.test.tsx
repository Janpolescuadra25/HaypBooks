import '@testing-library/jest-dom'

// Avoid router/app-shell invariants in SSR by mocking client/navigation components used in the page
jest.mock('@/lib/server-url', () => ({ getBaseUrl: () => 'http://localhost' }))
jest.mock('@/components/ReportHeader', () => ({ ReportHeader: () => null }))
jest.mock('@/components/AccessDeniedCard', () => ({ AccessDeniedCard: () => null }))
jest.mock('next/link', () => ({ __esModule: true, default: ({ children }: any) => children }))

describe('Open Invoices date formatting and alignment', () => {
  it('renders invoice and due dates as MM/DD/YYYY and aligns numeric cells', async () => {
    const payload = {
      period: 'Custom',
      asOf: '2025-09-24',
      rows: [
        { customer: 'Acme', type: 'Invoice', number: 'INV-1001', invoiceDate: '2025-09-10', dueDate: '2025-10-10', aging: 14, openBalance: 1234.56 },
        { customer: 'Bravo', type: 'Invoice', number: 'INV-1002', invoiceDate: '2025-09-11T00:00:00Z', dueDate: '2025-10-11', aging: 13, openBalance: 789.01 },
      ],
      totals: { openBalance: 2023.57 },
    }

    const fetchSpy = jest
      .spyOn(global, 'fetch' as any)
      .mockResolvedValueOnce({ ok: true, json: async () => payload })

    const mod = await import('@/app/reports/open-invoices/page')
    const el = await (mod as any).default({ searchParams: {} })
    const html = typeof el === 'string' ? el : require('react-dom/server').renderToStaticMarkup(el)

    // Dates as mm/dd/yyyy
    expect(html).toMatch(/09\/10\/2025/)
    expect(html).toMatch(/09\/11\/2025/)

    // Due dates also mm/dd/yyyy
    expect(html).toMatch(/10\/10\/2025/)
    expect(html).toMatch(/10\/11\/2025/)

  // Numeric columns should have tabular-nums (aging and open balance)
  expect(html).toMatch(/<td[^>]*class=\"[^\"]*tabular-nums[^\"]*\"[^>]*>14<\/td>/)
  // Allow Amount to wrap the currency value in a span
  expect(html).toMatch(/<td[^>]*class=\"[^\"]*tabular-nums[^\"]*\"[^>]*>(?:<span>)?\$1,234\.56(?:<\/span>)?<\/td>/)
  // And totals row should also allow optional span
  expect(html).toMatch(/<td[^>]*class=\"[^\"]*tabular-nums[^\"]*font-medium[^\"]*\"[^>]*>(?:<span>)?\$2,023\.57(?:<\/span>)?<\/td>/)

    fetchSpy.mockRestore()
  })
})
