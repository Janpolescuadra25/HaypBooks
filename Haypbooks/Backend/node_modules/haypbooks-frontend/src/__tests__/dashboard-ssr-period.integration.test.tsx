import React from 'react'
import { render, screen, cleanup } from '@testing-library/react'

// Hoist a mock for next/dynamic to avoid loadable shared runtime during SSR tests
jest.mock('next/dynamic', () => ({
  __esModule: true,
  default:
    (_loader: any, _opts?: any) =>
      function DynamicStub(props: any) {
        return React.createElement('span', { 'data-testid': 'dynamic-stub' })
      },
}))

describe('Dashboard SSR - respects ?period= in monthly series fetch', () => {
  const realFetch = global.fetch

  beforeEach(() => {
    jest.resetModules()
    // Allow reports:read by default
    jest.doMock('@/lib/rbac-server', () => ({
      getRoleFromCookies: () => 'admin',
      hasPermission: () => true,
    }))

    // Stable base URL to avoid depending on headers()
    jest.doMock('@/lib/server-url', () => ({ getBaseUrl: () => 'http://test.local' }))

    // Mock client components that rely on next/navigation or client hooks context
    jest.doMock('@/components/PeriodSwitcher', () => ({
      __esModule: true,
      default: ({ current }: { current: string }) => React.createElement('div', { 'data-testid': 'period-switcher' }, current),
    }))
    jest.doMock('@/components/ProfileCard', () => ({
      __esModule: true,
      ProfileCard: () => React.createElement('div', { 'data-testid': 'profile-card' }, 'Profile'),
      default: () => React.createElement('div', { 'data-testid': 'profile-card' }, 'Profile'),
    }))

    // Mock next/dynamic to avoid loadable context in SSR tests
    jest.doMock('next/dynamic', () => ({
      __esModule: true,
      default:
        (_loader: any, _opts?: any) =>
          function DynamicStub(props: any) {
            // Render a simple span placeholder; content not asserted in these tests
            return React.createElement('span', { 'data-testid': 'dynamic-stub' })
          },
    }))

    global.fetch = (async (input: RequestInfo | URL) => {
      const url = typeof input === 'string' ? input : (input as URL).toString()
      // Normalize just the path+query for matching
      const u = new URL(url, 'http://test.local')
      const path = u.pathname + (u.search || '')

      // Monthly P&L mocked responses based on period
      if (path.startsWith('/api/reports/profit-loss-by-month')) {
        const period = u.searchParams.get('period') || 'YTD'
        if (period === 'YTD') {
          const payload = {
            period: 'YTD',
            start: '2025-01-01',
            end: '2025-02-28',
            months: ['2025-01', '2025-02'],
            lines: [
              { name: 'Revenue', values: [1000, 1200] },
              { name: 'Operating Expenses', values: [-600, -700] },
              { name: 'Net Income', values: [400, 500] },
            ],
          }
          return new Response(JSON.stringify(payload), { status: 200, headers: { 'Content-Type': 'application/json' } })
        }
        if (period === 'LastMonth') {
          const payload = {
            period: 'LastMonth',
            start: '2025-08-01',
            end: '2025-08-31',
            months: ['2025-08'],
            lines: [
              { name: 'Revenue', values: [2000] },
              { name: 'Operating Expenses', values: [-1200] },
              { name: 'Net Income', values: [800] },
            ],
          }
          return new Response(JSON.stringify(payload), { status: 200, headers: { 'Content-Type': 'application/json' } })
        }
      }

      // Dashboard summary with required shape
      if (path.startsWith('/api/dashboard/summary')) {
        const payload = {
          period: new URL(url).searchParams.get('period') || 'YTD',
          start: '2025-01-01',
          end: '2025-02-28',
          asOf: '2025-02-28',
          kpis: {
            revenue: { current: 2200, prev: 2000 },
            expenses: { current: 1300, prev: 1200 },
            netIncome: { current: 900, prev: 800 },
            cash: { current: 15000, prev: 14000 },
            ar: { current: 5000, prev: 4500 },
            ap: { current: 3000, prev: 2800 },
          },
          recentTransactions: [],
          counts: { openInvoices: 1, overdueInvoices: 0, openBills: 2, overdueBills: 0 },
        }
        return new Response(JSON.stringify(payload), { status: 200, headers: { 'Content-Type': 'application/json' } })
      }

      return new Response('Not Found', { status: 404 })
    }) as any
  })

  afterEach(() => {
    cleanup()
    global.fetch = realFetch as any
    jest.dontMock('@/lib/server-url')
    jest.dontMock('@/lib/rbac-server')
    jest.dontMock('@/components/PeriodSwitcher')
    jest.dontMock('@/components/ProfileCard')
  })

  it('renders monthly charts with YTD range', async () => {
    const mod = await import('@/app/page')
    const HomePage = mod.default as any
    const element = await HomePage({ searchParams: { period: 'YTD' } })
    render(element)
    expect(
      screen.getByRole('img', { name: /Revenue trend 2025-01-01 to 2025-02-28/i })
    ).toBeInTheDocument()
    expect(
      screen.getByRole('img', { name: /Net income trend 2025-01-01 to 2025-02-28/i })
    ).toBeInTheDocument()
  })

  it('renders monthly charts with LastMonth range', async () => {
    const mod = await import('@/app/page')
    const HomePage = mod.default as any
    const element = await HomePage({ searchParams: { period: 'LastMonth' } })
    render(element)
    expect(
      screen.getByRole('img', { name: /Revenue trend 2025-08-01 to 2025-08-31/i })
    ).toBeInTheDocument()
    expect(
      screen.getByRole('img', { name: /Net income trend 2025-08-01 to 2025-08-31/i })
    ).toBeInTheDocument()
  })
})
