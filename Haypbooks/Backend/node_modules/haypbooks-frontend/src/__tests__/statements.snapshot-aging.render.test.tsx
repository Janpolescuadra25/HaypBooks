import React from 'react'
import { render, screen } from '@testing-library/react'

describe('Customer Statement page — snapshot + aging render', () => {
  const origFetch = global.fetch

  beforeEach(() => {
    jest.resetModules()
    // Provide app-router hooks so client components (ExportCsvButton/RefreshButton) don't require real context
    jest.doMock('next/navigation', () => ({
      useSearchParams: () => new URLSearchParams(''),
      useRouter: () => ({ refresh: jest.fn(), push: jest.fn(), back: jest.fn() }),
    }))
    ;(global as any).fetch = jest.fn((url: string) => {
      if (typeof url === 'string' && url.includes('/api/customers/') && url.includes('/statement')) {
        const lines = [
          { id: 'inv1', type: 'invoice', date: '2025-09-01', description: 'Invoice INV-001', amount: 200, runningBalance: 200 },
          { id: 'pay1', type: 'payment', date: '2025-09-05', description: 'Payment applied to INV-001', amount: -50, runningBalance: 150 }
        ]
        const aging = { totals: { current: 100, 30: 25, 60: 15, 90: 5, '120+': 5, total: 150 } as any }
        return Promise.resolve(new Response(JSON.stringify({ customer: { id: 'c1', name: 'Acme Co' }, asOf: '2025-10-01', lines, totals: { invoices: 200, payments: -50, credits: 0, net: 150 }, aging }), { status: 200 }))
      }
      if (typeof url === 'string' && url.includes('/api/customers/') && url.includes('/ar-snapshot')) {
        return Promise.resolve(new Response(JSON.stringify({ snapshot: { customerId: 'c1', asOf: '2025-10-01', openInvoices: 2, openBalance: 150, unappliedCredits: 0, netReceivable: 150, lastPaymentDate: '2025-09-05', nextDueDate: '2025-10-15' } }), { status: 200 }))
      }
      return Promise.resolve(new Response('not found', { status: 404 }))
    }) as any
    jest.doMock('@/lib/server-url', () => ({ getBaseUrl: () => 'http://localhost:3000' }))
    jest.doMock('@/components/Amount', () => ({ __esModule: true, default: ({ value }: any) => <span>${Number(value).toFixed(2)}</span> }))
  })

  afterEach(() => {
    ;(global as any).fetch = origFetch as any
    jest.resetModules()
    jest.clearAllMocks()
  })

  test('shows snapshot tiles and aging summary with currency formatting', async () => {
    const Page = (await import('@/app/sales/statements/[id]/page')).default as any
    const el = await Page({ params: { id: 'c1' }, searchParams: { asOf: '2025-10-01' } })
    render(el)

    // Header
    expect(screen.getByText(/Statement - Acme Co/)).toBeInTheDocument()

    // Snapshot tiles
    expect(screen.getByText('Open Invoices')).toBeInTheDocument()
    expect(screen.getByText('2')).toBeInTheDocument()
    expect(screen.getByText('Open Balance')).toBeInTheDocument()
  expect(screen.getAllByText('$150.00').length).toBeGreaterThanOrEqual(1)

    // Aging header & columns
    expect(screen.getByText('Aging')).toBeInTheDocument()
    expect(screen.getByText('120+')).toBeInTheDocument()
    expect(screen.getByText('Total')).toBeInTheDocument()

    // Aging totals formatted as currency
    expect(screen.getByText('$100.00')).toBeInTheDocument() // Current
    expect(screen.getByText('$25.00')).toBeInTheDocument()  // 30
    expect(screen.getByText('$15.00')).toBeInTheDocument()  // 60
  expect(screen.getAllByText('$5.00').length).toBeGreaterThanOrEqual(2)   // 90 and 120+
    // Total present
    expect(screen.getAllByText('$150.00').length).toBeGreaterThanOrEqual(2) // appears in snapshot and aging total
  })
})
