import React from 'react'
import { render, screen } from '@testing-library/react'

describe('Customer detail page — Promises metrics render', () => {
  const origFetch = global.fetch

  beforeEach(() => {
    jest.resetModules()
    jest.doMock('next/navigation', () => ({
      useSearchParams: () => new URLSearchParams(''),
      useRouter: () => ({ refresh: jest.fn(), push: jest.fn(), back: jest.fn() }),
    }))
    jest.doMock('next/dynamic', () => {
      const React = require('react')
      return (loader: any) => {
        const src = typeof loader === 'function' ? String(loader) : ''
        if (src.includes("@/components/Amount")) {
          const Amt = ({ value }: any) => <span>${Number(value).toFixed(2)}</span>
          ;(Amt as any).displayName = 'MockAmountDynamic'
          return Amt
        }
        return () => null
      }
    })
    ;(global as any).fetch = jest.fn((url: string) => {
      if (typeof url === 'string' && url.endsWith('/api/customers/c1')) {
        return Promise.resolve(new Response(JSON.stringify({ customer: { id: 'c1', name: 'Promised Co', email: 'x@y.com', phone: '123' } }), { status: 200 }))
      }
      if (typeof url === 'string' && url.includes('/api/customers/c1/ar-snapshot')) {
        return Promise.resolve(new Response(JSON.stringify({ snapshot: { customerId: 'c1', asOf: '2025-10-01', openInvoices: 2, openBalance: 300, unappliedCredits: 0, netReceivable: 300, lastPaymentDate: '2025-09-20', nextDueDate: '2025-10-15', overdueBalance: 150, daysSinceLastPayment: 21, openPromises: 1, nextPromiseDate: '2025-10-20', promiseAgingDays: 0, riskLevel: 'moderate' } }), { status: 200 }))
      }
      return Promise.resolve(new Response('not found', { status: 404 }))
    }) as any
    jest.doMock('@/lib/server-url', () => ({ getBaseUrl: () => 'http://localhost:3000' }))
    jest.doMock('@/lib/rbac', () => ({ getRoleFromCookies: () => 'admin', hasPermission: () => true }))
    jest.doMock('@/components/AuditEventsPanel', () => ({ __esModule: true, default: () => null }))
  })

  afterEach(() => {
    ;(global as any).fetch = origFetch as any
    jest.resetModules()
    jest.clearAllMocks()
  })

  test('renders promises tiles and filtered collections link', async () => {
    const Page = (await import('@/app/customers/[id]/page')).default as any
    const el = await Page({ params: { id: 'c1' } })
    render(el)

    expect(screen.getByText('Promised Co')).toBeInTheDocument()
    // Tiles
    expect(screen.getByText('Open Promises')).toBeInTheDocument()
    expect(screen.getByText('1')).toBeInTheDocument()
    expect(screen.getByText('Next Promise Date')).toBeInTheDocument()
    expect(screen.getByText('2025-10-20')).toBeInTheDocument()
    expect(screen.getByText('Promise Aging (days)')).toBeInTheDocument()
    expect(screen.getByText('0')).toBeInTheDocument()
    // Link includes customerId
    const coll = screen.getByRole('link', { name: /Collections overview/i })
    expect(coll.getAttribute('href')).toContain('/reports/collections-overview')
    expect(coll.getAttribute('href')).toContain('customerId=c1')
  })
})
