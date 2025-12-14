import React from 'react'
import { render, screen, waitFor, within } from '@testing-library/react'

describe('Customer detail page — A/R snapshot banner render', () => {
  const origFetch = global.fetch

  beforeEach(() => {
    jest.resetModules()
    // Provide app-router hooks so client components don't require real context
    jest.doMock('next/navigation', () => ({
      useSearchParams: () => new URLSearchParams(''),
      useRouter: () => ({ refresh: jest.fn(), push: jest.fn(), back: jest.fn() }),
    }))
    // Mock next/dynamic: render Amount inline, no-op others to avoid loadable hooks in JSDOM
    jest.doMock('next/dynamic', () => {
      const React = require('react')
      return (loader: any, _opts?: any) => {
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
        return Promise.resolve(new Response(JSON.stringify({ customer: { id: 'c1', name: 'Acme Co', email: 'a@a.com', phone: '555' } }), { status: 200 }))
      }
      if (typeof url === 'string' && url.includes('/api/customers/c1/ar-snapshot')) {
        return Promise.resolve(new Response(JSON.stringify({ snapshot: { customerId: 'c1', asOf: '2025-10-01', openInvoices: 3, openBalance: 275, unappliedCredits: 25, netReceivable: 250, lastPaymentDate: '2025-09-20', nextDueDate: '2025-10-15', overdueBalance: 100, daysSinceLastPayment: 21, creditLimit: 1000, creditUtilizationPct: 27.5, riskLevel: 'moderate' } }), { status: 200 }))
      }
      return Promise.resolve(new Response('not found', { status: 404 }))
    }) as any
    jest.doMock('@/lib/server-url', () => ({ getBaseUrl: () => 'http://localhost:3000' }))
  // Direct import path not used here due to dynamic mock, but safe to include
  jest.doMock('@/components/Amount', () => ({ __esModule: true, default: ({ value }: any) => <span>${Number(value).toFixed(2)}</span> }))
    jest.doMock('@/lib/rbac', () => ({ getRoleFromCookies: () => 'admin', hasPermission: () => true }))
    jest.doMock('@/components/AuditEventsPanel', () => ({ __esModule: true, default: () => null }))
  })

  afterEach(() => {
    ;(global as any).fetch = origFetch as any
    jest.resetModules()
    jest.clearAllMocks()
  })

  test('renders snapshot tiles with values and links', async () => {
    const Page = (await import('@/app/customers/[id]/page')).default as any
    const el = await Page({ params: { id: 'c1' } })
    render(el)

    expect(screen.getByText('Acme Co')).toBeInTheDocument()
    expect(screen.getByText(/A\/R snapshot/)).toBeInTheDocument()
    // Tiles
    expect(screen.getByText('Open Invoices')).toBeInTheDocument()
    expect(screen.getByText('3')).toBeInTheDocument()
    expect(screen.getByText('Open Balance')).toBeInTheDocument()
    expect(screen.getByText('$275.00')).toBeInTheDocument()
    expect(screen.getByText('Unapplied Credits')).toBeInTheDocument()
    expect(screen.getByText('$25.00')).toBeInTheDocument()
    expect(screen.getByText('Net Receivable')).toBeInTheDocument()
    expect(screen.getByText('$250.00')).toBeInTheDocument()
    expect(screen.getByText('Last Payment')).toBeInTheDocument()
    expect(screen.getByText('Next Due')).toBeInTheDocument()
  // Optional tiles
  expect(screen.getByText('Overdue Balance')).toBeInTheDocument()
  expect(screen.getByText('$100.00')).toBeInTheDocument()
  expect(screen.getByText('Days Since Last Payment')).toBeInTheDocument()
  expect(screen.getByText('21')).toBeInTheDocument()
  expect(screen.getByText('Credit Limit')).toBeInTheDocument()
  expect(screen.getByText(/\$\s*1,?000\.00/)).toBeInTheDocument()
  expect(screen.getByText('Utilization %')).toBeInTheDocument()
  const utilLabel = screen.getByText('Utilization %')
  const utilTile = utilLabel.closest('div.rounded') || utilLabel.parentElement
  expect(utilTile).toBeTruthy()
  expect(within(utilTile as HTMLElement).getByText(/27\.5\s*%/)).toBeInTheDocument()
  // Links
    const stmt = screen.getByRole('link', { name: /View statement/i })
    expect(stmt).toHaveAttribute('href', '/sales/statements/c1')
    const coll = screen.getByRole('link', { name: /Collections overview/i })
    expect(coll.getAttribute('href')).toContain('/reports/collections-overview')
  })
})
