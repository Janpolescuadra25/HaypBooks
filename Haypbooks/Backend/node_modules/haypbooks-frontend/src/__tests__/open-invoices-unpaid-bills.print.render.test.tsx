import React from 'react'
import { render, screen } from '@testing-library/react'

describe('Open Invoices & Unpaid Bills Print pages', () => {
  const origFetch = global.fetch

  beforeEach(() => {
    jest.resetModules()
    ;(global as any).fetch = jest.fn((url: string) => {
      if (typeof url === 'string' && url.includes('/api/reports/open-invoices')) {
        const rows = [{ customer: 'Acme Co', type: 'Invoice', number: 'INV-2', invoiceDate: '2025-09-05', dueDate: '2025-09-20', aging: 3, openBalance: 250 }]
        return Promise.resolve(new Response(JSON.stringify({ asOf: '2025-09-15', period: 'MTD', rows, totals: { openBalance: 250 } }), { status: 200 }))
      }
      if (typeof url === 'string' && url.includes('/api/reports/unpaid-bills')) {
        const rows = [{ vendor: 'Vendor B', number: 'B-22', billDate: '2025-09-03', dueDate: '2025-09-18', terms: 'Net 15', amountDue: 120 }]
        return Promise.resolve(new Response(JSON.stringify({ asOf: '2025-09-15', period: 'MTD', rows, totals: { amountDue: 120 } }), { status: 200 }))
      }
      return Promise.resolve(new Response('not found', { status: 404 }))
    }) as any
    jest.doMock('@/lib/server-url', () => ({ getBaseUrl: () => 'http://localhost:3000' }))
    jest.doMock('next/link', () => ({ __esModule: true, default: ({ href, children, ...rest }: any) => <a href={href} {...rest}>{children}</a> }))
    jest.doMock('@/components/Amount', () => ({ __esModule: true, default: ({ value }: any) => <span>${'{'}Number(value).toFixed(2){'}'}</span> }))
  })

  afterEach(() => {
    ;(global as any).fetch = origFetch as any
    jest.resetModules()
    jest.clearAllMocks()
  })

  test('Open Invoices print renders caption and totals', async () => {
    const Page = (await import('@/app/reports/open-invoices/print/page')).default as any
    const el = await Page({ searchParams: { start: '2025-09-01', end: '2025-09-15' } })
    render(el)
  expect(screen.getByText('Open Invoices')).toBeInTheDocument()
  expect(screen.getByText('September 1-15, 2025')).toBeInTheDocument()
  expect(screen.getByText(/Totals/)).toBeInTheDocument()
  })

  test('Unpaid Bills print renders caption and totals', async () => {
    const Page = (await import('@/app/reports/unpaid-bills/print/page')).default as any
    const el = await Page({ searchParams: { end: '2025-09-15' } })
    render(el)
    expect(screen.getByText('Unpaid Bills')).toBeInTheDocument()
    expect(screen.getByText('September 15, 2025')).toBeInTheDocument()
    expect(screen.getByText(/Totals/)).toBeInTheDocument()
  })
})
