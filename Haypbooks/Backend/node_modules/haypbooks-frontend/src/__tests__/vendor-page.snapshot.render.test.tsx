import React from 'react'
import { render, screen } from '@testing-library/react'

describe('Vendor detail page — A/P snapshot banner render', () => {
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
      if (typeof url === 'string' && url.endsWith('/api/vendors/v1')) {
        return Promise.resolve(new Response(JSON.stringify({ vendor: { id: 'v1', name: 'Supply Co', email: 'v@v.com', phone: '555' } }), { status: 200 }))
      }
      if (typeof url === 'string' && url.includes('/api/vendors/v1/ap-snapshot')) {
        return Promise.resolve(new Response(JSON.stringify({ snapshot: { vendorId: 'v1', asOf: '2025-10-01', openBills: 4, openBalance: 500, unappliedCredits: 50, netPayable: 450, lastPaymentDate: '2025-09-18', nextDueDate: '2025-10-10', riskLevel: 'elevated' } }), { status: 200 }))
      }
      return Promise.resolve(new Response('not found', { status: 404 }))
    }) as any
    jest.doMock('@/lib/server-url', () => ({ getBaseUrl: () => 'http://localhost:3000' }))
    jest.doMock('@/components/Amount', () => ({ __esModule: true, default: ({ value }: any) => <span>${Number(value).toFixed(2)}</span> }))
    jest.doMock('@/lib/rbac', () => ({ getRoleFromCookies: () => 'admin', hasPermission: () => true }))
    jest.doMock('@/components/AuditEventsPanel', () => ({ __esModule: true, default: () => null }))
  })

  afterEach(() => {
    ;(global as any).fetch = origFetch as any
    jest.resetModules()
    jest.clearAllMocks()
  })

  test('renders A/P snapshot tiles with values and links', async () => {
    const Page = (await import('@/app/vendors/[id]/page')).default as any
    const el = await Page({ params: { id: 'v1' } })
    render(el)

    expect(screen.getByText('Supply Co')).toBeInTheDocument()
    expect(screen.getByText(/A\/P snapshot/)).toBeInTheDocument()
    // Tiles
    expect(screen.getByText('Open Bills')).toBeInTheDocument()
    expect(screen.getByText('4')).toBeInTheDocument()
    expect(screen.getByText('Open Balance')).toBeInTheDocument()
    expect(screen.getByText('$500.00')).toBeInTheDocument()
    expect(screen.getByText('Unapplied Credits')).toBeInTheDocument()
    expect(screen.getByText('$50.00')).toBeInTheDocument()
    expect(screen.getByText('Net Payable')).toBeInTheDocument()
    expect(screen.getByText('$450.00')).toBeInTheDocument()
    expect(screen.getByText('Last Payment')).toBeInTheDocument()
    expect(screen.getByText('Next Due')).toBeInTheDocument()
    // Links
    const stmts = screen.getAllByRole('link', { name: /View statement/i })
    const hrefs = stmts.map((a: any) => a.getAttribute('href'))
    expect(hrefs).toEqual(expect.arrayContaining(['/vendor-statements/v1', '/expenses/vendor-statements/v1']))
  })
})
