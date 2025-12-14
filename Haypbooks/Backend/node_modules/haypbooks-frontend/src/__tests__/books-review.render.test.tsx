import React from 'react'
import { render, screen, cleanup } from '@testing-library/react'

describe('Books review page - render', () => {
  const realFetch = global.fetch

  beforeEach(() => {
    jest.resetModules()
    // SSR base URL stub
    jest.doMock('@/lib/server-url', () => ({ getBaseUrl: () => 'http://test.local' }))
    // Allow RBAC by default
    jest.doMock('@/lib/rbac-server', () => ({ getRoleFromCookies: () => 'admin', hasPermission: () => true }))

    global.fetch = (async (input: RequestInfo | URL) => {
      const url = typeof input === 'string' ? input : (input as URL).toString()
      const u = new URL(url, 'http://test.local')
      const path = u.pathname

      if (path === '/api/reconciliation/summary') {
        const payload = {
          buckets: [],
          inflows: 12345,
          outflows: 9876,
          net: 2469,
          progress: 75,
          counts: { for_review: 3, categorized: 10, excluded: 1 },
        }
        return new Response(JSON.stringify(payload), { status: 200, headers: { 'Content-Type': 'application/json' } })
      }
      if (path === '/api/reports/ar-aging') {
        return new Response(JSON.stringify({ totals: { total: 4321 } }), { status: 200, headers: { 'Content-Type': 'application/json' } })
      }
      if (path === '/api/reports/ap-aging') {
        return new Response(JSON.stringify({ totals: { total: 2100 } }), { status: 200, headers: { 'Content-Type': 'application/json' } })
      }
      if (path === '/api/reports/invalid-journal-transactions') {
        return new Response(JSON.stringify({ total: 2, asOf: '2025-09-21' }), { status: 200, headers: { 'Content-Type': 'application/json' } })
      }
      if (path === '/api/periods') {
        return new Response(JSON.stringify({ closedThrough: '2025-06-30' }), { status: 200, headers: { 'Content-Type': 'application/json' } })
      }

      return new Response('Not Found', { status: 404 })
    }) as any
  })

  afterEach(() => {
    cleanup()
    global.fetch = realFetch as any
    jest.dontMock('@/lib/server-url')
    jest.dontMock('@/lib/rbac-server')
  })

  it('shows reconciliation snapshot, aging totals, exceptions and close date', async () => {
    const mod = await import('@/app/books-review/page')
    const Page = mod.default as any
    const element = await Page()
    render(element)

    // Recon
    expect(screen.getByLabelText(/Reconciliation status/i)).toBeInTheDocument()
    expect(screen.getByText(/Progress/i).nextSibling?.textContent).toContain('75%')
    expect(screen.getByText(/Inflows/i).nextSibling?.textContent).toMatch(/\$/)
    expect(screen.getByText(/Outflows/i).nextSibling?.textContent).toMatch(/\$/)
    expect(screen.getByText(/Transactions to review/i)).toHaveTextContent('3')

    // Aging totals
    expect(screen.getByText(/A\/R total/i).parentElement).toHaveTextContent('$')
    expect(screen.getByText(/A\/P total/i).parentElement).toHaveTextContent('$')

    // Exceptions and close
    expect(screen.getByLabelText(/Exceptions and warnings/i)).toHaveTextContent('Open issues: 2')
    expect(screen.getByLabelText(/Close period/i)).toHaveTextContent('Closed through: 2025-06-30')

    // Links
    expect(screen.getByRole('link', { name: /Open Reconcile/i })).toHaveAttribute('href', '/transactions/reconcile')
  expect(screen.getByRole('link', { name: /Categorize transactions/i })).toHaveAttribute('href', '/bank-transactions?bankStatus=for_review')
    expect(screen.getByRole('link', { name: /View A\/R aging/i })).toHaveAttribute('href', '/reports/ar-aging')
    expect(screen.getByRole('link', { name: /View A\/P aging/i })).toHaveAttribute('href', '/reports/ap-aging')
    expect(screen.getByRole('link', { name: /Open report/i })).toHaveAttribute('href', '/reports/invalid-journal-transactions')
    expect(screen.getByRole('link', { name: /Manage close date/i })).toHaveAttribute('href', '/settings/close-books')
  })
})
