import React from 'react'
import { render, screen, act } from '@testing-library/react'

// Mock the server URL helper so we don't invoke next/headers in a non-request test context
jest.mock('@/lib/server-url', () => ({ getBaseUrl: () => 'http://localhost:3000' }))
// Mock next/navigation hooks used inside BackButton, ReportHeader, etc.
jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: jest.fn(), prefetch: jest.fn() }),
  useSearchParams: () => new URLSearchParams(),
  usePathname: () => '/reports/test',
}))

// We will import a couple of report pages and ensure their drill-down links contain a from= param.
// These pages are server components; for this light test we mock fetch and render their default export as a function call.

// Minimal mock for global fetch to return deterministic JSON structures used by pages.
const mockNow = new Date('2024-01-15T00:00:00Z')

beforeAll(() => {
  // Cast to any to avoid strict type mismatch between jest spy expected signature and fetch overloads
  jest.spyOn(global as any, 'fetch').mockImplementation((input: any) => {
    const url = typeof input === 'string' ? input : input.toString()
    if (url.includes('/api/reports/ar-aging?') || url.endsWith('/api/reports/ar-aging')) {
      return Promise.resolve(new Response(JSON.stringify({
        period: 'THIS_MONTH',
        asOf: mockNow.toISOString(),
        rows: [
          { name: 'Acme Corp', current: 100, 30: 0, 60: 0, 90: 0, '120+': 0, total: 100 },
        ],
        totals: { current: 100, 30: 0, 60: 0, 90: 0, '120+': 0, total: 100 }
      }), { status: 200 }))
    }
    if (url.includes('/api/reports/expenses-by-vendor-summary')) {
      return Promise.resolve(new Response(JSON.stringify({
        period: 'THIS_MONTH',
        asOf: mockNow.toISOString(),
        rows: [
          { vendor: 'Supply Co', amount: 250 }
        ],
        totals: { transactions: 1, qty: 1, amount: 250 }
      }), { status: 200 }))
    }
    return Promise.resolve(new Response(JSON.stringify({}), { status: 404 }))
  })
})

afterAll(() => {
  ;(global.fetch as any).mockRestore?.()
})

// Lazy imports inside test to avoid Next.js SSR specifics; treating server component as async function.

describe('Report drill-down links include deterministic from parameter', () => {
  it('A/R Aging customer name link has from=', async () => {
    const ARAgingPage = (await import('@/app/reports/ar-aging/page')).default as any
  const ui = await ARAgingPage({ searchParams: { period: 'THIS_MONTH' } })
  await act(async () => { render(ui) })
    const link = screen.getByRole('link', { name: /view aging detail for acme corp/i })
    expect(link).toHaveAttribute('href')
    const href = link.getAttribute('href')!
    expect(href).toMatch(/from=%2Freports%2Far-aging/) // encoded /reports/ar-aging
    expect(decodeURIComponent(href)).toContain('/reports/ar-aging?period=THIS_MONTH')
  })

  it('Expenses by Vendor Summary vendor drill-down has from=', async () => {
    const Page = (await import('@/app/reports/expenses-by-vendor-summary/page')).default as any
  const ui = await Page({ searchParams: { period: 'THIS_MONTH' } })
  await act(async () => { render(ui) })
    const link = screen.getByRole('link', { name: /Supply Co/i })
    const href = link.getAttribute('href')!
    expect(href).toMatch(/from=%2Freports%2Fexpenses-by-vendor-summary/) // encoded origin
    expect(decodeURIComponent(href)).toContain('/reports/expenses-by-vendor-summary?period=THIS_MONTH')
  })
})
