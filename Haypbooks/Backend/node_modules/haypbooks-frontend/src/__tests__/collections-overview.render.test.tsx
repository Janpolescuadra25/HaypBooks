import React from 'react'
import { render, screen } from '@testing-library/react'

// Mock Amount for deterministic rendering
jest.mock('@/components/Amount', () => ({ __esModule: true, default: ({ value }: any) => <span>${Number(value).toFixed(2)}</span> }))

const origFetch = global.fetch

describe('Collections Overview Page', () => {
  beforeEach(() => {
    jest.resetModules()
    ;(global as any).fetch = jest.fn((url: string) => {
      if (typeof url === 'string' && url.includes('/api/collections/overview')) {
        const overview = {
          asOf: '2025-10-01',
          rows: [
            { name: 'Customer A', riskLevel: 'low', openInvoices: 2, openBalance: 300, overdueBalance: 50, netReceivable: 250 },
          ],
          totals: { customers: 1, openBalance: 300, overdueBalance: 50, netReceivable: 250 },
        }
        return Promise.resolve(new Response(JSON.stringify({ overview }), { status: 200 }))
      }
      return Promise.resolve(new Response('not found', { status: 404 }))
    }) as any
  })
  afterEach(() => { ;(global as any).fetch = origFetch as any; jest.clearAllMocks() })

  it('renders headers and totals', async () => {
    const Page = (await import('@/app/reports/collections-overview/page')).default as any
    const ui = await Page({ searchParams: { asOf: '2025-10-01' } as any })
    render(ui)
    expect(screen.getByText('Collections Overview')).toBeInTheDocument()
  // Caption shows a formatted date (no literal 'As of' per UI conventions)
  expect(screen.getByText('October 1, 2025')).toBeInTheDocument()
    expect(screen.getByText('Customer')).toBeInTheDocument()
    expect(screen.getByText('Overdue')).toBeInTheDocument()
    expect(screen.getByText('Totals')).toBeInTheDocument()
  })
})
