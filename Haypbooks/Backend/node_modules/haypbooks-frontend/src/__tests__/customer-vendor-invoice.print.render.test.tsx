import React from 'react'
import { render, screen } from '@testing-library/react'

describe('Customer/Vendor Balance Detail and Invoice List by Date Print pages', () => {
  const origFetch = global.fetch

  beforeEach(() => {
    jest.resetModules()
    ;(global as any).fetch = jest.fn((url: string) => {
      if (typeof url === 'string' && url.includes('/api/reports/customer-balance-detail')) {
        const rows = [{ date: '2025-09-02', type: 'Invoice', number: 'INV-10', customer: 'Acme Co', memo: 'Test', amount: 100 }]
        return Promise.resolve(new Response(JSON.stringify({ asOf: '2025-09-15', period: 'MTD', rows, totals: { amount: 100 } }), { status: 200 }))
      }
      if (typeof url === 'string' && url.includes('/api/reports/vendor-balance-detail')) {
        const rows = [{ date: '2025-09-03', type: 'Bill', number: 'B-10', vendor: 'Vendor B', memo: 'Supplies', amount: 75 }]
        return Promise.resolve(new Response(JSON.stringify({ asOf: '2025-09-15', period: 'MTD', rows, totals: { amount: 75 } }), { status: 200 }))
      }
      if (typeof url === 'string' && url.includes('/api/reports/invoice-list-by-date')) {
        const rows = [{ date: '2025-09-05', number: 'INV-3', customer: 'Acme Co', memo: 'Consulting', amount: 250, openBalance: 50 }]
        return Promise.resolve(new Response(JSON.stringify({ asOf: '2025-09-15', period: 'MTD', rows, totals: { amount: 250, openBalance: 50 } }), { status: 200 }))
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

  test('Customer Balance Detail print renders caption and totals', async () => {
    const Page = (await import('@/app/reports/customer-balance-detail/print/page')).default as any
    const el = await Page({ searchParams: { end: '2025-09-15' } })
    render(el)
    expect(screen.getByText('Customer Balance Detail')).toBeInTheDocument()
    expect(screen.getByText('September 15, 2025')).toBeInTheDocument()
    expect(screen.getByText(/Totals/)).toBeInTheDocument()
  })

  test('Vendor Balance Detail print renders caption and totals', async () => {
    const Page = (await import('@/app/reports/vendor-balance-detail/print/page')).default as any
    const el = await Page({ searchParams: { start: '2025-09-01', end: '2025-09-15' } })
    render(el)
    expect(screen.getByText('Vendor Balance Detail')).toBeInTheDocument()
    expect(screen.getByText('September 1-15, 2025')).toBeInTheDocument()
    expect(screen.getByText(/Total|Totals/)).toBeInTheDocument()
  })

  test('Invoice List by Date print renders caption and totals', async () => {
    const Page = (await import('@/app/reports/invoice-list-by-date/print/page')).default as any
    const el = await Page({ searchParams: { start: '2025-09-01', end: '2025-09-15' } })
    render(el)
    expect(screen.getByText('Invoice List by Date')).toBeInTheDocument()
    expect(screen.getByText('September 1-15, 2025')).toBeInTheDocument()
    expect(screen.getByText(/Totals/)).toBeInTheDocument()
  })
})
